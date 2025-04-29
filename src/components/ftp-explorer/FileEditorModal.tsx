
import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, Code, Edit3 } from "lucide-react";
import { ClineChatDrawer } from "./ClineChatDrawer";
import { FileEditorToolbar } from "./FileEditorToolbar";
import { EditorPreviewSplit } from "./EditorPreviewSplit";
import { EditorStateDisplay } from "./EditorStateDisplay";
import { useFileEditor } from "@/hooks/useFileEditor";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  
  const {
    code,
    isLoading,
    isSaving,
    error,
    hasUnsavedChanges,
    handleCodeChange,
    handleSave,
    loadFile,
    detectLanguage
  } = useFileEditor(connectionId, filePath);
  
  useEffect(() => {
    if (isOpen && connectionId && filePath) {
      loadFile();
    }
  }, [isOpen, connectionId, filePath]);

  // Check if file can be edited in WYSIWYG mode
  const supportsWysiwyg = /\.(html?|htm|php)$/i.test(filePath);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-screen-xl w-[95vw] h-[90vh] p-0 flex flex-col">
        <div className="modal-header flex items-center justify-between px-4 py-2">
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
            </div>
          )}
        </div>
        
        <FileEditorToolbar
          fileName={filePath}
          onSave={handleSave}
          isSaving={isSaving}
          hasUnsavedChanges={hasUnsavedChanges}
        />
        
        <EditorStateDisplay 
          isLoading={isLoading}
          error={error}
          onRetry={loadFile}
        />
        
        {!isLoading && !error && (
          <div className="modal-body h-full flex flex-col">
            <EditorPreviewSplit
              code={code}
              filePath={filePath}
              onCodeChange={handleCodeChange}
              detectLanguage={detectLanguage}
              editorMode={editorMode}
            />
            
            <ClineChatDrawer
              filePath={filePath}
              code={code}
              onInsert={handleCodeChange}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
