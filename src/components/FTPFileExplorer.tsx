
import { useState } from "react";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFileTree } from "@/hooks/use-file-tree";
import { useFileContent } from "@/hooks/use-file-content";
import { FTPFileList } from "./FTPFileList";
import { CodeEditor } from "./editor/CodeEditor";
import { FileItem } from "@/types/ftp";
import { toast } from "sonner";

interface FTPFileExplorerProps {
  connection: {
    id: string;
    server_name: string;
    host: string;
    port: number;
    username: string;
    password: string;
    root_directory: string | null;
    web_url: string | null;
    created_at: string;
  };
  onClose: () => void;
}

const FTPFileExplorer = ({ connection, onClose }: FTPFileExplorerProps) => {
  const [currentPath, setCurrentPath] = useState<string>("/");
  const [currentFilePath, setCurrentFilePath] = useState("");
  const { treeData, isLoading, refreshDirectory } = useFileTree({ connection });
  const { 
    content, 
    isLoading: isFileLoading, 
    isSaving,
    hasUnsavedChanges,
    updateContent,
    saveContent
  } = useFileContent({ 
    connection, 
    filePath: currentFilePath 
  });

  const handleNavigate = async (path: string) => {
    setCurrentPath(path);
    try {
      await refreshDirectory(path);
    } catch (error) {
      toast.error(`Failed to navigate to ${path}: ${error.message}`);
    }
  };

  const handleSelectFile = (filePath: string) => {
    setCurrentFilePath(filePath);
  };

  // Convert flat treeData to FileItem[] for the current path
  const currentFiles: FileItem[] = treeData
    .filter(node => {
      const nodePath = node.path.split('/').slice(0, -1).join('/') + '/';
      return nodePath === currentPath;
    })
    .map(node => ({
      name: node.name,
      size: node.size || 0,
      modified: node.modified || new Date().toISOString(),
      type: node.isDirectory ? "directory" : "file",
      isDirectory: node.isDirectory,
    }));

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-ezgray-dark">
        <h2 className="text-lg font-semibold text-ezwhite">
          {connection.server_name} Files
        </h2>
        <Button variant="outline" size="icon" onClick={onClose}>
          <XCircle className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row h-full">
        <div className="w-full md:w-1/2 p-4 border-r border-ezgray-dark">
          <FTPFileList
            currentPath={currentPath}
            files={currentFiles}
            onNavigate={handleNavigate}
            isLoading={isLoading}
          />
        </div>

        <div className="w-full md:w-1/2 p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-md font-semibold text-ezwhite">
              {currentFilePath ? currentFilePath.split('/').pop() || 'File Content' : 'File Content'}
            </h3>
            <Button 
              onClick={saveContent}
              disabled={!currentFilePath || isSaving || !hasUnsavedChanges} 
              className="bg-ezblue hover:bg-ezblue/90"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
          {!currentFilePath ? (
            <div className="flex items-center justify-center h-64 text-ezgray border border-dashed border-ezgray-dark rounded-md">
              Select a file to view its contents
            </div>
          ) : isFileLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-ezblue"></div>
            </div>
          ) : (
            <CodeEditor
              content={content}
              language="plaintext"
              onChange={(newContent) => updateContent(newContent || "")}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default FTPFileExplorer;
