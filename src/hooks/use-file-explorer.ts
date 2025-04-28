
import { useFileExplorerStore } from "@/store/fileExplorerStore";
import { listDir } from "@/lib/ftp";
import { normalizePath } from "@/utils/path";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import type { FtpConnection } from "@/hooks/use-ftp-connections";

export function useFileExplorer() {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const {
    activeConnection, setActiveConnection,
    currentPath, setCurrentPath,
    currentFilePath, setCurrentFilePath,
    fileContent, setFileContent,
    files, setFiles,
    isLoading, setIsLoading,
    hasUnsavedChanges, setHasUnsavedChanges,
    showFileBrowser, setShowFileBrowser,
    showFileEditor, setShowFileEditor,
    showAIAssistant, setShowAIAssistant,
  } = useFileExplorerStore();

  useEffect(() => {
    if (activeConnection && showFileBrowser) {
      const startPath = activeConnection.root_directory ? normalizePath(activeConnection.root_directory) : "/";
      loadDirectory(startPath);
    }
  }, [activeConnection, showFileBrowser]);

  const loadDirectory = async (path: string) => {
    if (!activeConnection) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const normalizedPath = normalizePath(path);
      console.log(`[loadDirectory] Original: "${path}" → Normalized: "${normalizedPath}"`);
      
      const result = await listDir(activeConnection.id, normalizedPath);
      
      if (result && result.data && result.data.files) {
        setFiles(result.data.files);
        setCurrentPath(normalizedPath);
      } else {
        console.error("[useFileExplorer] Invalid response format:", result);
        throw new Error("Invalid response format from server");
      }
    } catch (error: any) {
      console.error("[useFileExplorer] Directory loading error:", error);
      setError(error.message || "Failed to load directory");
      toast.error(`Failed to load directory: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const selectFile = async (file: { key: string; isDir: boolean }): Promise<void> => {
    if (file.isDir) {
      return loadDirectory(file.key);
    } else {
      setCurrentFilePath(file.key);
      if (activeConnection) {
        return fetchFileContent();
      }
      return Promise.resolve();
    }
  };

  const fetchFileContent = async (): Promise<void> => {
    if (!activeConnection || !currentFilePath) {
      return Promise.resolve();
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`[fetchFileContent] Loading: ${currentFilePath} from connection: ${activeConnection.id}`);
      console.time(`[FTP] ${currentFilePath}`);
      
      const { data, error: supabaseError } = await supabase.functions.invoke('getFile', {
        body: {
          id: activeConnection.id,
          filepath: currentFilePath
        }
      });

      console.timeEnd(`[FTP] ${currentFilePath}`);

      if (supabaseError) {
        const errorMsg = supabaseError.message || "Unknown error";
        console.log('→ status: error, bytes: 0, error:', errorMsg);
        setError(errorMsg);
        toast.error(`Error loading file: ${errorMsg}`);
        setFileContent("");
        setHasUnsavedChanges(false);
        return Promise.reject(errorMsg);
      }
      
      if (data && data.content) {
        const content = data.content || "";
        console.log(`→ status: success, bytes: ${content.length}`);
        setFileContent(content);
        setError(null);
        setHasUnsavedChanges(false);
        return Promise.resolve();
      } else {
        const errorMsg = data?.message || data?.error || 'Unknown error';
        console.log('→ status: error, bytes: 0, error:', errorMsg);
        setError(errorMsg);
        setFileContent("");
        toast.error(`Failed to load file: ${errorMsg}`);
        return Promise.reject(errorMsg);
      }
    } catch (error: any) {
      console.error("[useFileExplorer] File loading error:", error);
      console.log('→ status: exception, bytes: 0, error:', error.message);
      setError(error.message || "Unknown error");
      setFileContent("");
      toast.error(`Error loading file: ${error.message}`);
      return Promise.reject(error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateFileContent = (newContent: string) => {
    setFileContent(newContent);
    setHasUnsavedChanges(true);
  };

  const saveFileContent = async () => {
    if (!activeConnection || !currentFilePath) {
      toast.error("No file selected");
      return;
    }

    setIsSaving(true);
    try {
      console.log(`[saveFileContent] Saving: ${currentFilePath}`);
      console.time(`[FTP Save] ${currentFilePath}`);
      
      const { data, error } = await supabase.functions.invoke("saveFile", {
        body: {
          id: activeConnection.id,
          filepath: currentFilePath,
          content: fileContent,
          username: "webapp-user"
        }
      });

      console.timeEnd(`[FTP Save] ${currentFilePath}`);
      
      if (error) {
        console.log('→ status: error saving, error:', error.message);
        throw error;
      }
      
      console.log('→ status: success saved');
      toast.success("File saved successfully!");
      setHasUnsavedChanges(false);
    } catch (error: any) {
      console.log('→ status: exception saving, error:', error.message);
      toast.error(`Failed to save file: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const openConnection = async (connection: FtpConnection) => {
    setActiveConnection(connection);
    setShowFileBrowser(true);
  };

  const applyAIResponse = (text: string) => {
    if (fileContent) {
      const newContent = fileContent + '\n' + text;
      updateFileContent(newContent);
      toast.success("AI response applied to editor");
    }
  };

  return {
    activeConnection,
    currentPath,
    currentFilePath,
    fileContent,
    files,
    isLoading,
    isSaving,
    hasUnsavedChanges,
    showFileBrowser,
    showFileEditor,
    showAIAssistant,
    error,
    
    setShowFileBrowser,
    setShowFileEditor,
    setShowAIAssistant,
    loadDirectory,
    selectFile,
    updateFileContent,
    saveFileContent,
    openConnection,
    applyAIResponse,
  };
}
