
import { useFileExplorerStore } from "@/store/fileExplorerStore";
import { listDirectory } from "@/lib/ftp";
import { normalizePath } from "@/utils/path";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import type { FtpConnection } from "@/hooks/use-ftp-connections";

export function useFileExplorer() {
  const [isSaving, setIsSaving] = useState(false);
  
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

  const loadDirectory = async (path: string) => {
    if (!activeConnection) return;
    
    setIsLoading(true);
    try {
      const normalizedPath = normalizePath(path);
      console.log(`[loadDirectory] Original: "${path}" → Normalized: "${normalizedPath}"`);
      const fileList = await listDirectory(activeConnection, normalizedPath);
      setFiles(fileList);
      setCurrentPath(normalizedPath);
    } catch (error: any) {
      console.error("[useFileExplorer] Directory loading error:", error);
      toast.error(`Failed to load directory: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const selectFile = async (file: { key: string; isDir: boolean }) => {
    if (file.isDir) {
      await loadDirectory(file.key);
    } else {
      setCurrentFilePath(file.key);
      if (activeConnection) {
        await fetchFileContent();
        setShowFileBrowser(false);
        setShowFileEditor(true);
      }
    }
  };

  const fetchFileContent = async () => {
    if (!activeConnection || !currentFilePath) return;
    
    setIsLoading(true);
    try {
      console.log(`[fetchFileContent] Loading: ${currentFilePath} from connection: ${activeConnection.id}`);
      
      const { data, error } = await supabase.functions.invoke('ftp-get-file', {
        body: {
          siteId: activeConnection.id,
          path: currentFilePath
        }
      });

      if (error) {
        toast.error(`Error loading file: ${error.message}`);
        throw error;
      }
      
      if (data && data.success) {
        const decodedContent = atob(data.content);
        setFileContent(decodedContent);
        setHasUnsavedChanges(false);
      } else {
        toast.error(`Failed to load file: ${data?.message || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error("[useFileExplorer] File loading error:", error);
      toast.error(`Error loading file: ${error.message}`);
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
      const response = await fetch(`https://natjhcqynqziccssnwim.supabase.co/functions/v1/ftp-upload-file`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          host: activeConnection.host,
          port: activeConnection.port,
          username: activeConnection.username,
          password: activeConnection.password,
          path: currentFilePath,
          content: btoa(fileContent)
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("File saved successfully!");
        setHasUnsavedChanges(false);
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast.error(`Failed to save file: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const openConnection = async (connection: FtpConnection) => {
    setActiveConnection(connection);
    const startPath = connection.root_directory ? normalizePath(connection.root_directory) : "/";
    setShowFileBrowser(true);
    await loadDirectory(startPath);
  };

  const applyAIResponse = (text: string) => {
    if (fileContent) {
      const newContent = fileContent + '\n' + text;
      updateFileContent(newContent);
      toast.success("AI response applied to editor");
    }
  };

  return {
    // State
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
    
    // Actions
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
