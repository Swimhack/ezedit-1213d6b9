
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
  const [editorContentReady, setEditorContentReady] = useState(false);
  const [contentValidated, setContentValidated] = useState(false);
  const editorRef = useRef<any>(null);
  
  const { isLoading, error, loadFile, setError, setIsLoading } = useFileLoader();
  const { isSaving, saveFileContent } = useFileSaver();
  
  // Autosave timer reference
  const autoSaveTimerRef = useRef<number | null>(null);
  
  // Reset state when file path changes, but keep content until new content is loaded
  useEffect(() => {
    setHasUnsavedChanges(false);
    setEditorContentReady(false);
    setContentValidated(false);
    
    // Clear any pending autosave when file changes
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }

    // Load new file content when path changes
    if (connectionId && filePath) {
      loadFileContent();
    }
  }, [filePath, connectionId]);
  
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
      setEditorContentReady(false);
      setContentValidated(false);
      
      // Fetch file content with cache busting
      const response = await fetch(`/api/readFile?path=${encodeURIComponent(connectionId + ":" + filePath)}&t=${Date.now()}`, {
        method: "GET",
        cache: "no-store",
        headers: {
          "Pragma": "no-cache", 
          "Cache-Control": "no-cache" 
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }
      
      const content = await response.text();
      
      // Strictly validate content before setting it
      if (!content || typeof content !== 'string' || content.trim().length === 0) {
        throw new Error("File content is invalid or empty");
      }
      
      console.log(`[useFileEditor] Content loaded successfully, length: ${content?.length || 0}`);
      setCode(content);
      setEditorContentReady(true);
      setContentValidated(true);
      setHasUnsavedChanges(false);
      
      // Force editor update if using WYSIWYG
      if (editorRef.current && typeof editorRef.current.setContent === 'function') {
        try {
          console.log("[useFileEditor] Forcing WYSIWYG editor update after load");
          editorRef.current.setContent(content);
        } catch (err) {
          console.error("[useFileEditor] Error updating WYSIWYG editor after load:", err);
        }
      }
      
      return content;
    } catch (error: any) {
      console.error(`[useFileEditor] Error loading file: ${filePath}`, error);
      setError(error.message || "Failed to load file");
      setEditorContentReady(false);
      setContentValidated(false);
      return "";
    } finally {
      setIsLoading(false);
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
    
    // Don't allow save if content is invalid
    if (!contentValidated || !code || code.trim().length === 0) {
      toast.error("Cannot save invalid or empty file content");
      return;
    }
    
    console.log(`[useFileEditor] Saving file: ${filePath}, content length: ${code.length}`);
    const result = await saveFileContent(connectionId, filePath, code);
    
    if (result.success) {
      console.log("[useFileEditor] Save successful");
      setHasUnsavedChanges(false);
      
      // Always use the saved content to ensure consistency
      if (result.content) {
        setCode(result.content);
        setEditorContentReady(true);
        
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
    // Validate the new content
    if (newCode === undefined || typeof newCode !== 'string' || newCode.trim().length === 0) {
      console.warn("[useFileEditor] Attempted to update with invalid content");
      return;
    }

    if (newCode !== code) {
      console.log(`[useFileEditor] Code changed, new length: ${newCode.length}`);
      setCode(newCode);
      setHasUnsavedChanges(true);
      
      // Only trigger autosave if content is validated and editor is ready
      if (autoSaveEnabled && contentValidated && editorContentReady) {
        // Clear any existing timer
        if (autoSaveTimerRef.current) {
          clearTimeout(autoSaveTimerRef.current);
        }
        
        // Set new timer for autosave (1500ms delay)
        setIsAutoSaving(true);
        autoSaveTimerRef.current = window.setTimeout(async () => {
          console.log("[useFileEditor] Autosaving...");
          if (connectionId && filePath && newCode !== undefined && newCode.trim().length > 0) {
            const result = await saveFileContent(connectionId, filePath, newCode);
            
            if (result.success) {
              setHasUnsavedChanges(false);
              
              // Ensure we use the saved content
              if (result.content) {
                setCode(result.content);
                setEditorContentReady(true);
                
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
            console.error("[useFileEditor] Cannot autosave - missing data or invalid content");
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
    
    // Clear any pending autosave when disabled
    if (autoSaveEnabled && autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
      setIsAutoSaving(false);
    }
  };
  
  /**
   * Force refresh file content with cache busting
   */
  const refreshFile = async () => {
    console.log("[useFileEditor] Force refreshing file content");
    
    setIsLoading(true);
    setEditorContentReady(false);
    setContentValidated(false);
    
    try {
      // Clear any pending autosave
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
        setIsAutoSaving(false);
      }
      
      // Use cache busting technique
      const response = await fetch(`/api/readFile?path=${encodeURIComponent(connectionId + ":" + filePath)}&t=${Date.now()}`, {
        method: "GET",
        cache: "no-store",
        headers: {
          "Pragma": "no-cache",
          "Cache-Control": "no-cache"
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }
      
      const content = await response.text();
      
      // Strictly validate content before setting it
      if (!content || typeof content !== 'string' || content.trim().length === 0) {
        throw new Error("File content is invalid or empty");
      }
      
      console.log(`[useFileEditor] Content refreshed successfully, length: ${content.length}`);
      setCode(content);
      setEditorContentReady(true);
      setContentValidated(true);
      setHasUnsavedChanges(false);
      
      // Force editor update if using WYSIWYG
      if (editorRef.current && typeof editorRef.current.setContent === 'function') {
        console.log("[useFileEditor] Forcing WYSIWYG editor update after refresh");
        try {
          editorRef.current.setContent(content);
        } catch (err) {
          console.error("[useFileEditor] Error updating WYSIWYG editor after refresh:", err);
        }
      }
      
      return content;
    } catch (error: any) {
      console.error(`[useFileEditor] Error refreshing file: ${filePath}`, error);
      setError(error.message || "Failed to refresh file");
      setEditorContentReady(false);
      setContentValidated(false);
      throw error;
    } finally {
      setIsLoading(false);
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

  return {
    code,
    isLoading,
    isSaving: isSaving || isAutoSaving,
    error,
    hasUnsavedChanges,
    autoSaveEnabled,
    isAutoSaving,
    editorRef,
    editorContentReady,
    contentValidated,
    handleCodeChange,
    handleSave,
    loadFile: loadFileContent,
    refreshFile,
    toggleAutoSave,
    detectLanguage: () => detectLanguage(filePath)
  };
}
