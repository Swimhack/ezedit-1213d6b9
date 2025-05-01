
import { useState, useEffect, useRef, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";
import { ClineChatDrawer } from "./ClineChatDrawer";
import { FileEditorToolbar } from "./FileEditorToolbar";
import { EditorPreviewSplit } from "../editor/EditorPreviewSplit";
import { EditorStateDisplay } from "@/components/editor/EditorStateDisplay";
import { FileEditorHeader } from "@/components/editor/FileEditorHeader";
import { EditorModeTabs } from "@/components/editor/EditorModeTabs";
import { useFileEditor } from "@/hooks/useFileEditor";

interface FileEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  connectionId: string;
  filePath: string;
}

export function FileEditorModal({
  isOpen,
  onClose,
  connectionId,
  filePath,
}: FileEditorModalProps) {
  const [editorMode, setEditorMode] = useState<'code' | 'wysiwyg'>('code');
  const [loadAttempts, setLoadAttempts] = useState(0);
  const [forceRefresh, setForceRefresh] = useState(0);
  const editorRef = useRef<any>(null);
  
  // Use our enhanced file editor hook
  const {
    code,
    isLoading,
    isSaving,
    error,
    hasUnsavedChanges,
    autoSaveEnabled,
    isAutoSaving,
    editorContentReady,
    contentValidated,
    handleCodeChange,
    handleSave,
    loadFile,
    refreshFile,
    toggleAutoSave,
    detectLanguage
  } = useFileEditor(connectionId, filePath);
  
  // Load file content when modal is opened or filePath changes
  const loadContent = useCallback(async () => {
    if (isOpen && connectionId && filePath) {
      console.log(`[FileEditorModal] Loading file content: ${filePath}`);
      
      try {
        const content = await loadFile();
        
        // Detect file type and set appropriate editor mode
        if (content) {
          const isHtml = /\.(html?|htm|php)$/i.test(filePath);
          setEditorMode(isHtml ? 'wysiwyg' : 'code');
          console.log(`[FileEditorModal] File type detected, setting editor mode to: ${isHtml ? 'wysiwyg' : 'code'}`);
        }
      } catch (err) {
        console.error(`[FileEditorModal] Error loading file:`, err);
        toast.error(`Failed to load file: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }
  }, [isOpen, connectionId, filePath, loadFile]);
  
  // Load file when modal opens or filePath changes
  useEffect(() => {
    loadContent();
  }, [isOpen, connectionId, filePath, loadAttempts, loadContent]);

  // Handle manual refresh with cache busting
  const handleRefresh = () => {
    setForceRefresh(prev => prev + 1);
    toast.info("Refreshing file content...");
    refreshFile().then(() => {
      toast.success("File content refreshed");
    }).catch(err => {
      toast.error(`Failed to refresh: ${err.message}`);
    });
  };

  // Handle close with unsaved changes warning
  const handleEditorClose = () => {
    if (hasUnsavedChanges) {
      if (confirm("You have unsaved changes. Are you sure you want to close?")) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const handleRetry = () => {
    toast.info("Retrying file load...");
    setLoadAttempts(prev => prev + 1);
  };

  // Check if file can be edited in WYSIWYG mode
  const supportsWysiwyg = /\.(html?|htm|php)$/i.test(filePath);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleEditorClose()}>
      <DialogContent className="max-w-screen-xl w-[95vw] h-[90vh] p-0 flex flex-col" hideCloseButton>
        <FileEditorHeader filePath={filePath} onClose={handleEditorClose} />
        
        <EditorModeTabs 
          editorMode={editorMode}
          setEditorMode={setEditorMode}
          supportsWysiwyg={supportsWysiwyg}
          onRefresh={handleRefresh}
        />
        
        <FileEditorToolbar
          fileName={filePath}
          onSave={handleSave}
          isSaving={isSaving}
          isAutoSaving={isAutoSaving} 
          hasUnsavedChanges={hasUnsavedChanges}
          onRefresh={handleRefresh}
          autoSaveEnabled={autoSaveEnabled}
          onToggleAutoSave={toggleAutoSave}
        />
        
        <EditorStateDisplay 
          isLoading={isLoading}
          error={error}
          onRetry={handleRetry}
        />
        
        {!isLoading && !error && (
          <div className="modal-body h-full flex flex-col overflow-hidden">
            <EditorPreviewSplit
                code={code || ""} 
                filePath={filePath}
                onCodeChange={handleCodeChange}
                detectLanguage={detectLanguage}
                editorMode={editorMode}
                forceRefresh={forceRefresh}
                editorContentReady={editorContentReady && contentValidated}
            />
            
            <ClineChatDrawer
              filePath={filePath}
              code={code || ""}
              onInsert={handleCodeChange}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
