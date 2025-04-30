
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useFileLoader } from "./useFileLoader";
import { useFileSaver } from "./useFileSaver";
import { detectLanguage } from "@/utils/file-language-detector";

/**
 * Main hook for file editing functionality
 */
export function useFileEditor(connectionId: string, filePath: string) {
  const [code, setCode] = useState<string | undefined>(undefined);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const editorRef = useRef<any>(null);
  
  const { isLoading, error, loadFile, setError, setIsLoading } = useFileLoader();
  const { isSaving, saveFileContent } = useFileSaver();
  
  // Reset state when file path changes
  useEffect(() => {
    setCode(undefined);
    setHasUnsavedChanges(false);
  }, [filePath]);
  
  /**
   * Load file content from FTP/SFTP connection
   */
  const loadFileContent = async () => {
    if (!connectionId || !filePath) {
      setError("Missing connection ID or file path");
      return "";
    }
    
    try {
      const content = await loadFile(connectionId, filePath);
      setCode(content);
      setHasUnsavedChanges(false);
      return content;
    } catch (error: any) {
      console.error("Error loading file:", error);
      return "";
    }
  };
  
  /**
   * Save file content to FTP connection
   */
  const handleSave = async () => {
    if (!connectionId || !filePath || code === undefined) {
      toast.error("Missing data for saving");
      return;
    }
    
    const success = await saveFileContent(connectionId, filePath, code);
    if (success) {
      setHasUnsavedChanges(false);
    }
  };
  
  /**
   * Update code in editor
   */
  const handleCodeChange = (newCode: string | undefined) => {
    if (newCode !== undefined && newCode !== code) {
      console.log(`[useFileEditor] Code changed, new length: ${newCode.length}`);
      setCode(newCode);
      setHasUnsavedChanges(true);
    }
  };
  
  /**
   * Force refresh file content with cache busting
   */
  const refreshFile = () => {
    console.log("[useFileEditor] Force refreshing file content");
    return loadFileContent();
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
    loadFile: loadFileContent,
    refreshFile,
    detectLanguage: () => detectLanguage(filePath)
  };
}
