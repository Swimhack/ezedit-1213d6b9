
import { useState } from "react";
import Editor from "@monaco-editor/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DiffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  remoteCode: string;
  localCode: string;
  isLoading?: boolean;
}

export function DiffModal({
  isOpen,
  onClose,
  onConfirm,
  remoteCode,
  localCode,
  isLoading = false
}: DiffModalProps) {
  const [isDiffReady, setIsDiffReady] = useState(false);

  const handleEditorDidMount = () => {
    setIsDiffReady(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>Review Changes</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 min-h-0">
          <Editor
            height="100%"
            theme="vs-dark"
            original={remoteCode}
            modified={localCode}
            options={{
              readOnly: true,
              minimap: { enabled: false }
            }}
            onMount={handleEditorDidMount}
            defaultLanguage="javascript"
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={onConfirm}
            disabled={!isDiffReady || isLoading}
          >
            {isLoading ? "Publishing..." : "Publish Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
