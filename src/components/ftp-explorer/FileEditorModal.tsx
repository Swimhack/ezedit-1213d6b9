
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { FileEditorToolbar } from "./FileEditorToolbar";
import { SplitEditor } from "../editor/SplitEditor";
import { useEffect, useRef, useState } from "react";

interface FileEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string | null;
  content: string;
  onSave: () => void;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  onContentChange: (content: string) => void;
}

export function FileEditorModal({
  isOpen,
  onClose,
  fileName,
  content,
  onSave,
  isSaving,
  hasUnsavedChanges,
  onContentChange,
}: FileEditorModalProps) {
  const editorRef = useRef<any>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      setIsEditorReady(false);
      const timer = setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.layout?.();
          setIsEditorReady(true);
        }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && editorRef.current && content) {
      const timer = setTimeout(() => {
        editorRef.current.layout?.();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, content]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0">
        <FileEditorToolbar 
          fileName={fileName} 
          onSave={onSave}
          isSaving={isSaving}
          hasUnsavedChanges={hasUnsavedChanges}
        />
        <div className="p-3 border-b border-ezgray-dark">
          <DialogTitle className="text-sm font-medium text-ezwhite">
            Editing: {fileName || 'Untitled File'}
          </DialogTitle>
        </div>
        <div className="flex-1 p-4 overflow-hidden">
          <div className="h-[calc(80vh-8rem)]">
            <SplitEditor
              fileName={fileName}
              content={content}
              onChange={onContentChange}
              editorRef={editorRef}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
