
import { useState, useRef, useEffect, useCallback } from "react";
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
  
  // Reset state when file path changes, but keep content until new content is loaded
  useEffect(() => {
    setHasUnsavedChanges(false);
    
    // Clear any pending autosave when file changes
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }
  }, [filePath]);
  
  /**
   * Load file content from FTP/SFTP connection with cache busting
   */
  const loadFileContent = useCallback(async () => {
    if (!connectionId || !filePath) {
      setError("Missing connection ID or file path");
      return "";
    }
    
    try {
      setIsLoading(true);
      // Use cache busting
      const timestamp = Date.now();
      console.log(`[useFileEditor] Loading file with cache busting: ${filePath}?t=${timestamp}`);
      
      // Using recommended fetch logic
      const response = await fetch(`/api/readFile?path=${encodeURIComponent(filePath)}&t=${timestamp}`, {
        cache: "no-store",
        headers: { "Pragma": "no-cache", "Cache-Control": "no-cache" },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }
      
      const content = await response.text();
      
      console.log(`[useFileEditor] Content loaded successfully, length: ${content?.length || 0}`);
      setCode(content);
      setHasUnsavedChanges(false);
      setIsLoading(false);
      return content;
    } catch (error: any) {
      console.error(`[useFileEditor] Error loading file: ${filePath}`, error);
      setError(error.message || "Failed to load file");
      setIsLoading(false);
      return "";
    }
  }, [connectionId, filePath, setError, setIsLoading]);
  
  /**
   * Save file content to FTP connection
   */
  const handleSave = async () => {
    if (!connectionId || !filePath || code === undefined) {
      toast.error("Missing data for saving");
      return;
    }
    
    console.log(`[useFileEditor] Saving file: ${filePath}, content length: ${code.length}`);
    const result = await saveFileContent(connectionId, filePath, code);
    
    if (result.success) {
      console.log("[useFileEditor] Save successful");
      setHasUnsavedChanges(false);
      // Ensure we're using the latest content without reloading
      if (result.content) {
        setCode(result.content);
        // Force editor update if using WYSIWYG
        if (editorRef.current && typeof editorRef.current.setContent === 'function') {
          console.log("[useFileEditor] Forcing WYSIWYG editor update after save");
          try {
            editorRef.current.setContent(result.content);
          } catch (err) {
            console.error("[useFileEditor] Error updating WYSIWYG editor:", err);
          }
        }
      }
    } else {
      console.error("[useFileEditor] Save failed");
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
          if (connectionId && filePath && newCode !== undefined) {
            const result = await saveFileContent(connectionId, filePath, newCode);
            
            if (result.success) {
              setHasUnsavedChanges(false);
              // Ensure we use the content we just saved
              if (result.content) {
                setCode(result.content);
                // Force editor update if using WYSIWYG
                if (editorRef.current && typeof editorRef.current.setContent === 'function') {
                  console.log("[useFileEditor] Forcing WYSIWYG editor update after autosave");
                  try {
                    editorRef.current.setContent(result.content);
                  } catch (err) {
                    console.error("[useFileEditor] Error updating WYSIWYG editor after autosave:", err);
                  }
                }
              }
              toast.success("File autosaved", {
                duration: 2000,
                position: "bottom-right",
              });
            }
          } else {
            console.error("[useFileEditor] Cannot autosave - missing data");
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
  const refreshFile = async () => {
    console.log("[useFileEditor] Force refreshing file content with cache busting");
    
    // Clear the current code to force a complete refresh
    // but only temporarily to avoid flickering
    setIsLoading(true);
    
    try {
      // Use the recommended fetch logic with cache busting
      const timestamp = Date.now();
      const response = await fetch(`/api/readFile?path=${encodeURIComponent(filePath)}&t=${timestamp}`, {
        cache: "no-store",
        headers: { "Pragma": "no-cache", "Cache-Control": "no-cache" },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }
      
      const content = await response.text();
      console.log(`[useFileEditor] Content refreshed successfully, length: ${content.length}`);
      setCode(content);
      setHasUnsavedChanges(false);
      setIsLoading(false);
      return content;
    } catch (error: any) {
      console.error(`[useFileEditor] Error refreshing file: ${filePath}`, error);
      setError(error.message || "Failed to refresh file");
      setIsLoading(false);
      throw error;
    }
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  // Initial load
  useEffect(() => {
    if (connectionId && filePath) {
      loadFileContent();
    }
  }, [connectionId, filePath, loadFileContent]);

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
