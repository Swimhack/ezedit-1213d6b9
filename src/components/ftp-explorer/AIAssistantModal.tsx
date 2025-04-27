
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import ClinePane from "../ClinePane";

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  filePath: string;
  fileContent: string;
  onApplyResponse: (text: string) => void;
}

export function AIAssistantModal({
  isOpen,
  onClose,
  filePath,
  fileContent,
  onApplyResponse,
}: AIAssistantModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col p-0">
        <div className="p-3 border-b border-ezgray-dark">
          <DialogTitle className="text-sm font-medium text-ezwhite">AI Assistant</DialogTitle>
        </div>
        <div className="flex-1">
          <ClinePane
            filePath={filePath}
            fileContent={fileContent}
            onApplyResponse={onApplyResponse}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
