
import { useState } from "react";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFileTree } from "@/hooks/use-file-tree";
import { useFileContent } from "@/hooks/use-file-content";
import { FTPFileList } from "./FTPFileList";
import { CodeEditor } from "./editor/CodeEditor";

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
  const { treeData: files, isLoading } = useFileTree({ connection });
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

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
  };

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
            files={files}
            onNavigate={handleNavigate}
            isLoading={isLoading}
          />
        </div>

        <div className="w-full md:w-1/2 p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-md font-semibold text-ezwhite">File Content</h3>
            <Button 
              onClick={saveContent}
              disabled={!currentFilePath || isSaving} 
              className="bg-ezblue hover:bg-ezblue/90"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
          {isFileLoading ? (
            <div className="text-ezgray">Loading editor...</div>
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
