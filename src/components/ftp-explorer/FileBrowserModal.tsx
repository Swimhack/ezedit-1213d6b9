
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { FTPFileList } from "@/components/FTPFileList";
import { FileExplorerHeader } from "./FileExplorerHeader";

interface FileBrowserModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPath: string;
  files: any[];
  isLoading: boolean;
  serverName: string;
  onNavigate: (path: string) => void;
  onSelectFile: (file: { key: string; isDir: boolean }) => void;
}

export function FileBrowserModal({
  isOpen,
  onClose,
  currentPath,
  files,
  isLoading,
  serverName,
  onNavigate,
  onSelectFile,
}: FileBrowserModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col p-0">
        <FileExplorerHeader serverName={serverName} onClose={onClose} />
        <div className="flex-1 overflow-hidden">
          <div className="p-3 border-b border-ezgray-dark">
            <DialogTitle className="text-sm font-medium text-ezwhite">
              {serverName} - File Explorer
            </DialogTitle>
          </div>
          <div className="flex-1 overflow-y-auto h-[calc(80vh-8rem)]">
            <FTPFileList
              currentPath={currentPath}
              files={files}
              onNavigate={onNavigate}
              onSelectFile={onSelectFile}
              isLoading={isLoading}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
