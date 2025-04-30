
import { useState, useRef, useEffect } from "react";
import { getFile, saveFile } from "@/lib/ftp";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function useFileEditor(connectionId: string, filePath: string) {
  const [code, setCode] = useState<string | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const editorRef = useRef<any>(null);
  
  // Reset state when file path changes
  useEffect(() => {
    setCode(undefined);
    setError(null);
    setIsLoading(true);
    setHasUnsavedChanges(false);
  }, [filePath]);
  
  const loadFile = async () => {
    if (!connectionId || !filePath) {
      setError("Missing connection ID or file path");
      setIsLoading(false);
      return "";
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`[useFileEditor] Loading file: ${filePath} for connection: ${connectionId}`);
      
      // First try using the SFTP function
      const response = await supabase.functions.invoke('sftp-file', {
        body: {
          siteId: connectionId,
          path: filePath
        }
      });
      
      console.log('[useFileEditor] SFTP response:', response);
      
      if (response.error) {
        throw new Error(response.error.message || "Failed to load file via SFTP");
      }
      
      if (response.data && response.data.success) {
        const fileContent = response.data.content || "";
        console.log(`[useFileEditor] File loaded successfully via SFTP, size: ${fileContent.length} bytes`);
        console.log("Visual fileContent typeof:", typeof fileContent);
        console.log("Visual fileContent length:", fileContent?.length);
        console.log("Visual preview content:", fileContent?.slice(0, 200));
        setCode(fileContent);
        setHasUnsavedChanges(false);
        setIsLoading(false);
        return fileContent;
      } else {
        throw new Error(response.data?.message || "Failed to load file content");
      }
    } catch (sftpError: any) {
      console.error("[useFileEditor] SFTP Error:", sftpError);
      
      // Fallback to the FTP get-file function
      try {
        console.log('[useFileEditor] Attempting fallback to ftp-get-file');
        
        const fallbackResponse = await supabase.functions.invoke('ftp-get-file', {
          body: {
            siteId: connectionId,
            path: filePath
          }
        });
        
        console.log('[useFileEditor] FTP fallback response:', fallbackResponse);
        
        if (fallbackResponse.error) {
          throw new Error(fallbackResponse.error.message || "Failed to load file (fallback failed)");
        }
        
        const { data } = fallbackResponse;
        
        if (data && data.success) {
          // For ftp-get-file, content might be base64 encoded
          let decodedContent = data.content;
          if (typeof data.content === 'string' && data.content.match(/^[A-Za-z0-9+/=]+$/)) {
            try {
              decodedContent = atob(data.content);
              console.log('[useFileEditor] Successfully decoded base64 content');
            } catch (e) {
              console.warn("[useFileEditor] Content doesn't appear to be valid base64, using as-is");
            }
          }
          
          console.log(`[useFileEditor] File loaded successfully via FTP fallback, size: ${decodedContent?.length || 0} bytes`);
          console.log("Visual fileContent typeof:", typeof decodedContent);
          console.log("Visual fileContent length:", decodedContent?.length);
          console.log("Visual preview content:", decodedContent?.slice(0, 200));
          setCode(decodedContent || "");
          setHasUnsavedChanges(false);
          setIsLoading(false);
          return decodedContent || "";
        } else {
          throw new Error(data?.message || "Failed to load file content");
        }
      } catch (ftpError: any) {
        console.error("[useFileEditor] FTP Fallback Error:", ftpError);
        setError(ftpError.message || "Failed to load file after multiple attempts");
        setIsLoading(false);
        return "";
      }
    }
  };
  
  const handleSave = async () => {
    if (!connectionId || !filePath || code === undefined) {
      toast.error("Missing data for saving");
      return;
    }
    
    setIsSaving(true);
    
    try {
      const { error } = await saveFile({
        id: connectionId,
        filepath: filePath,
        content: code,
        username: "editor-user"
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      toast.success("File saved successfully");
      setHasUnsavedChanges(false);
    } catch (error: any) {
      console.error("Error saving file:", error);
      toast.error(`Error saving file: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleCodeChange = (newCode: string | undefined) => {
    if (newCode !== undefined && newCode !== code) {
      console.log(`[useFileEditor] Code changed, new length: ${newCode.length}`);
      setCode(newCode);
      setHasUnsavedChanges(true);
    }
  };
  
  // Language detection helper
  const detectLanguage = () => {
    if (!filePath) return "plaintext";
    
    const extension = filePath.split('.').pop()?.toLowerCase();
    const langMap: Record<string, string> = {
      js: "javascript",
      jsx: "javascript",
      ts: "typescript",
      tsx: "typescript",
      html: "html",
      htm: "html",
      css: "css",
      json: "json",
      md: "markdown",
      php: "php",
      py: "python",
      rb: "ruby",
      go: "go",
      java: "java",
      c: "c",
      cpp: "cpp",
      cs: "csharp",
      sql: "sql",
      yml: "yaml",
      yaml: "yaml",
      xml: "xml",
      sh: "shell",
      bash: "shell",
      txt: "plaintext"
    };
    
    return langMap[extension || ""] || "plaintext";
  };

  return {
    code,
    isLoading,
    isSaving,
    error,
    hasUnsavedChanges,
    editorRef,
    handleCodeChange,
    handleSave,
    loadFile,
    detectLanguage
  };
}
