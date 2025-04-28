
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { FTPFileList } from "@/components/FTPFileList";
import { FileExplorerHeader } from "./FileExplorerHeader";
import { useFileExplorerStore } from "@/store/fileExplorerStore";
import { toast } from "sonner";

interface FileBrowserModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPath: string;
  files: any[];
  isLoading: boolean;
  serverName: string;
  onNavigate: (path: string) => void;
  onSelectFile: (file: { key: string; isDir: boolean }) => Promise<void>;
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
  // Use store to access setShowFileEditor function
  const setShowFileEditor = useFileExplorerStore(state => state.setShowFileEditor);
  const setIsLoading = useFileExplorerStore(state => state.setIsLoading);
  
  // Enhanced onSelectFile handler that ensures file loading completes before opening editor
  const handleSelectFile = async (file: { key: string; isDir: boolean }) => {
    if (!file.isDir) {
      try {
        setIsLoading(true);
        // First call the original onSelectFile to load the file content
        await onSelectFile(file);
        // Then open the editor modal after file is loaded
        setShowFileEditor(true);
      } catch (error) {
        console.error("[FileBrowserModal] Error loading file:", error);
        toast.error("Failed to load file content. Please try again.");
      } finally {
        setIsLoading(false);
      }
    } else {
      // For directories, just use original handler
      onSelectFile(file);
    }
  };

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
              onSelectFile={handleSelectFile}
              isLoading={isLoading}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
