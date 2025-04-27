
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { FileEditorToolbar } from "./FileEditorToolbar";
import { SplitEditor } from "../editor/SplitEditor";
import { useEffect, useRef, useState } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface FileEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string | null;
  content: string;
  onSave: () => void;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  onContentChange: (content: string) => void;
  error?: string;
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
  error,
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
        {error && (
          <Alert variant="destructive" className="mx-4 mt-4 bg-red-950/30 border-red-800">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>FTP Error</AlertTitle>
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}
        <div className="flex-1 p-4 overflow-hidden">
          <div className="h-[calc(80vh-8rem)]">
            <SplitEditor
              fileName={fileName}
              content={content}
              onChange={onContentChange}
              editorRef={editorRef}
              error={error}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
