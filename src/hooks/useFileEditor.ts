
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
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const editorRef = useRef<any>(null);
  
  const { isLoading, error, loadFile, setError, setIsLoading } = useFileLoader();
  const { isSaving, saveFileContent } = useFileSaver();
  
  // Autosave timer reference
  const autoSaveTimerRef = useRef<number | null>(null);
  
  // Reset state when file path changes
  useEffect(() => {
    setCode(undefined);
    setHasUnsavedChanges(false);
    
    // Clear any pending autosave when file changes
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }
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
   * Update code in editor with autosave
   */
  const handleCodeChange = (newCode: string | undefined) => {
    if (newCode !== undefined && newCode !== code) {
      console.log(`[useFileEditor] Code changed, new length: ${newCode.length}`);
      setCode(newCode);
      setHasUnsavedChanges(true);
      
      // Trigger autosave if enabled
      if (autoSaveEnabled) {
        // Clear any existing timer
        if (autoSaveTimerRef.current) {
          clearTimeout(autoSaveTimerRef.current);
        }
        
        // Set new timer for autosave (1500ms delay)
        setIsAutoSaving(true);
        autoSaveTimerRef.current = window.setTimeout(async () => {
          console.log("[useFileEditor] Autosaving...");
          const success = await saveFileContent(connectionId, filePath, newCode);
          
          if (success) {
            setHasUnsavedChanges(false);
            toast.success("File autosaved", {
              duration: 2000,
              position: "bottom-right",
            });
          }
          setIsAutoSaving(false);
          autoSaveTimerRef.current = null;
        }, 1500);
      }
    }
  };
  
  /**
   * Toggle autosave functionality
   */
  const toggleAutoSave = () => {
    setAutoSaveEnabled(prev => !prev);
    toast.info(`Autosave ${!autoSaveEnabled ? 'enabled' : 'disabled'}`, {
      duration: 2000,
    });
  };
  
  /**
   * Force refresh file content with cache busting
   */
  const refreshFile = () => {
    console.log("[useFileEditor] Force refreshing file content");
    return loadFileContent();
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  return {
    code,
    isLoading,
    isSaving: isSaving || isAutoSaving,
    error,
    hasUnsavedChanges,
    autoSaveEnabled,
    isAutoSaving,
    editorRef,
    handleCodeChange,
    handleSave,
    loadFile: loadFileContent,
    refreshFile,
    toggleAutoSave,
    detectLanguage: () => detectLanguage(filePath)
  };
}
