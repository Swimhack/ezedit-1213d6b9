
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { DualEditor } from "../editor/DualEditor";
import { FileEditorToolbar } from "./FileEditorToolbar";
import { getLanguageFromFileName } from "@/utils/language-detector";
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
  
  // Reset editor ready state when modal opens/closes
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

  // Ensure layout is called when content changes
  useEffect(() => {
    if (isOpen && editorRef.current && content) {
      const timer = setTimeout(() => {
        editorRef.current.layout?.();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, content]);

  const getFileLanguage = () => {
    if (!fileName) return "plaintext";
    return getLanguageFromFileName(fileName) || "plaintext";
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      onContentChange(value);
    }
  };

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
          <div className="h-[calc(80vh-8rem)] border border-ezgray-dark rounded">
            <DualEditor
              content={content}
              language={getFileLanguage()}
              onChange={handleEditorChange}
              editorRef={editorRef}
              fileName={fileName || undefined}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
