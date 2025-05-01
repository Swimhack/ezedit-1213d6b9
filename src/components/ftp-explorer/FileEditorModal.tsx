
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { FileEditorContent } from "@/components/ftp-explorer/FileEditorContent";
import { Button } from "@/components/ui/button";
import { Loader2, Save, Wand2 } from "lucide-react";

interface FileEditorModalProps {
  isOpen: boolean;
  filePath: string;
  fileContent: string;
  onClose: () => void;
  onContentChange: (content: string) => void;
  onSave: () => Promise<void>;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  onOpenAIAssistant: () => void;
}

export function FileEditorModal({
  isOpen,
  filePath,
  fileContent,
  onClose,
  onContentChange,
  onSave,
  hasUnsavedChanges,
  isSaving,
  onOpenAIAssistant
}: FileEditorModalProps) {
  const filename = filePath.split('/').pop() || '';
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 gap-0">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-medium">{filename}</h2>
            <Badge variant="outline" className="text-xs">
              {fileContent ? "✅ Live File Loaded" : "Loading..."}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenAIAssistant}
              disabled={isSaving}
            >
              <Wand2 className="h-4 w-4 mr-2" />
              AI Edit
            </Button>
            <Button
              size="sm"
              onClick={onSave}
              disabled={isSaving || !hasUnsavedChanges}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save
            </Button>
          </div>
        </div>

        <div className="flex-grow overflow-auto p-0">
          <FileEditorContent
            filePath={filePath}
            content={fileContent}
            onContentChange={onContentChange}
            readOnly={false}
            isLoading={!fileContent}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
