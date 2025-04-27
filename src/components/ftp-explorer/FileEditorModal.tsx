
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { CodeEditor } from "../editor/CodeEditor";
import { FileEditorToolbar } from "./FileEditorToolbar";
import { getLanguageFromFileName } from "@/utils/language-detector";
import { useEffect, useRef } from "react";

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
  
  // Force editor to refresh when modal opens
  useEffect(() => {
    if (isOpen && editorRef.current) {
      // Small delay to ensure the DOM is fully rendered
      const timer = setTimeout(() => {
        editorRef.current?.layout?.();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, content]);

  const getFileLanguage = () => {
    if (!fileName) return "plaintext";
    return getLanguageFromFileName(fileName) || "plaintext";
  };

  // Handler to ensure content changes are properly captured
  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      onContentChange(value);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
            <CodeEditor
              content={content}
              language={getFileLanguage()}
              onChange={handleEditorChange}
              editorRef={editorRef}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
