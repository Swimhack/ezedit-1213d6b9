
import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, Code, Edit3 } from "lucide-react";
import { ClineChatDrawer } from "./ClineChatDrawer";
import { FileEditorToolbar } from "./FileEditorToolbar";
import { EditorPreviewSplit } from "./EditorPreviewSplit";
import { EditorStateDisplay } from "./EditorStateDisplay";
import { useFileEditor } from "@/hooks/useFileEditor";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
  const [draggingSplitter, setDraggingSplitter] = useState(false);
  const [editorMode, setEditorMode] = useState<'code' | 'wysiwyg'>('code');
  const [loadAttempts, setLoadAttempts] = useState(0);
  const [forceRefresh, setForceRefresh] = useState(0);
  
  const {
    code,
    isLoading,
    isSaving,
    error,
    hasUnsavedChanges,
    handleCodeChange,
    handleSave,
    loadFile,
    refreshFile,
    detectLanguage
  } = useFileEditor(connectionId, filePath);
  
  // Use a callback for loading file to prevent dependency issues
  const fetchFileContent = useCallback(async () => {
    if (isOpen && connectionId && filePath) {
      console.log(`[FileEditorModal] Loading file: ${filePath}, connectionId: ${connectionId}`);
      try {
        const content = await loadFile();
        console.log(`[FileEditorModal] File loaded successfully, length: ${content?.length || 0}`);
        
        // Detect if this is an HTML file and set editor mode appropriately
        if (content && /\.(html?|htm|php)$/i.test(filePath)) {
          // Check for HTML content signatures
          if (/<!DOCTYPE html|<html|<body|<head|<div|<p|<script|<style/i.test(content)) {
            console.log('[FileEditorModal] HTML content detected, switching to WYSIWYG mode');
            setEditorMode('wysiwyg');
          }
        }
      } catch (err) {
        console.error(`[FileEditorModal] Failed to load file: ${filePath}`, err);
        toast.error(`Failed to load file: ${err.message || "Unknown error"}`);
      }
    }
  }, [isOpen, connectionId, filePath, loadFile]);

  // Handle manual refresh
  const handleRefresh = () => {
    setForceRefresh(prev => prev + 1);
    toast.info("Refreshing file content...");
    refreshFile().then(() => {
      toast.success("File content refreshed");
    }).catch(err => {
      toast.error(`Failed to refresh: ${err.message}`);
    });
  };

  // Load file when modal opens or when connection/path/attempts/forceRefresh change
  useEffect(() => {
    if (isOpen) {
      console.log(`[FileEditorModal] Modal opened, triggering file load for ${filePath}`);
      fetchFileContent();
    } else {
      console.log('[FileEditorModal] Modal closed');
    }
  }, [fetchFileContent, isOpen, loadAttempts, forceRefresh]);

  const handleRetry = () => {
    toast.info("Retrying file load...");
    setLoadAttempts(prev => prev + 1);
  };

  // Check if file can be edited in WYSIWYG mode
  const supportsWysiwyg = /\.(html?|htm|php)$/i.test(filePath);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-screen-xl w-[95vw] h-[90vh] p-0 flex flex-col">
        <div className="modal-header flex items-center justify-between px-4 py-2 border-b">
          <h2 className="text-lg font-semibold truncate">{filePath}</h2>
          <button 
            onClick={onClose} 
            aria-label="Close" 
            className="w-4 h-4"
          >
            <X />
          </button>
        </div>
        
        <div className="editor-mode-tabs px-4 py-1">
          {supportsWysiwyg && (
            <div className="flex items-center space-x-2">
              <Button 
                size="sm" 
                variant={editorMode === 'code' ? 'default' : 'outline'}
                onClick={() => setEditorMode('code')}
                className="flex items-center gap-1"
              >
                <Code className="w-4 h-4" />
                Code
              </Button>
              <Button 
                size="sm" 
                variant={editorMode === 'wysiwyg' ? 'default' : 'outline'}
                onClick={() => setEditorMode('wysiwyg')}
                className="flex items-center gap-1"
              >
                <Edit3 className="w-4 h-4" />
                Visual
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleRefresh}
                className="flex items-center gap-1 ml-2"
              >
                Refresh Content
              </Button>
            </div>
          )}
        </div>
        
        <FileEditorToolbar
          fileName={filePath}
          onSave={handleSave}
          isSaving={isSaving}
          hasUnsavedChanges={hasUnsavedChanges}
          onRefresh={handleRefresh}
        />
        
        <EditorStateDisplay 
          isLoading={isLoading}
          error={error}
          onRetry={handleRetry}
        />
        
        {!isLoading && !error && (
          <div className="modal-body h-full flex flex-col">
            <EditorPreviewSplit
                code={code || ""} /* Ensure we pass empty string instead of undefined */
                filePath={filePath}
                onCodeChange={handleCodeChange}
                detectLanguage={detectLanguage}
                editorMode={editorMode}
                forceRefresh={forceRefresh}
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
