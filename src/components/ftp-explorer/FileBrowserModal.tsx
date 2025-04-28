
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { FileExplorerHeader } from "./FileExplorerHeader";
import { FTPFileList } from "@/components/FTPFileList";
import { FileEditorModal } from "./FileEditorModal";
import { useFileExplorerStore } from "@/store/fileExplorerStore";

interface FileBrowserModalProps {
  isOpen: boolean;
  onClose: () => void;
  serverName: string;
  currentPath: string;
  files: any[];
  isLoading: boolean;
  onNavigate: (path: string) => void;
  onSelectFile: (file: { key: string; isDir: boolean }) => Promise<void> | void;
}

export function FileBrowserModal({
  isOpen,
  onClose,
  serverName,
  currentPath,
  files,
  isLoading,
  onNavigate,
  onSelectFile
}: FileBrowserModalProps) {
  // Use store to access activeConnection
  const activeConnection = useFileExplorerStore(state => state.activeConnection);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  
  // Enhanced onSelectFile handler that opens the editor modal for files
  const handleSelectFile = async (file: { key: string; isDir: boolean }) => {
    if (file.isDir) {
      // For directories, just use original handler
      onSelectFile(file);
    } else {
      // For files, store the path and open the editor modal
      setSelectedFile(file.key);
      // Still call the original handler to load file content
      await onSelectFile(file);
    }
  };
  
  // Effect to ensure files are loaded when the modal is opened
  useEffect(() => {
    let timeout: number;
    
    if (isOpen && files.length === 0 && !isLoading) {
      // If modal is opened but no files are loaded yet, trigger navigation to current path
      timeout = window.setTimeout(() => {
        onNavigate(currentPath);
      }, 100);
    }
    
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [isOpen, files.length, isLoading, currentPath, onNavigate]);

  return (
    <>
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
      
      {activeConnection && selectedFile && (
        <FileEditorModal
          isOpen={!!selectedFile}
          onClose={() => setSelectedFile(null)}
          connectionId={activeConnection.id}
          filePath={selectedFile}
        />
      )}
    </>
  );
}
