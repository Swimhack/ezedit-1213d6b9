
import { useState, useEffect } from "react";
import { XCircle, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CodeEditor } from "./editor/CodeEditor";
import { listDirectory } from "@/lib/ftp";
import { useFtpFile } from "@/hooks/use-ftp-file";
import { toast } from "sonner";
import { normalizePath } from "@/utils/path";
import { FTPFileList } from "./FTPFileList";
import { useFileContent } from "@/hooks/use-file-content";
import { getLanguageFromFileName } from "@/utils/language-detector";

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
  const [files, setFiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { 
    content: fileContent, 
    isLoading: isFileLoading,
    updateContent,
    saveContent,
    isSaving,
    hasUnsavedChanges,
  } = useFileContent({ connection, filePath: currentFilePath });

  const loadDirectory = async (path: string) => {
    setIsLoading(true);
    try {
      // Normalize the path to ensure it has consistent formatting
      const normalizedPath = normalizePath(path);
      console.log(`[FTPFileExplorer] Loading directory: "${normalizedPath}"`);
      
      const files = await listDirectory(connection, normalizedPath);
      console.log(`[FTPFileExplorer] Loaded ${files.length} files from "${normalizedPath}":`, files);
      
      setFiles(files);
      setCurrentPath(normalizedPath);
    } catch (error: any) {
      console.error("[FTPFileExplorer] Directory loading error:", error);
      toast.error(`Failed to load directory: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Start by loading the root directory, or the configured root_directory if available
    const startPath = connection.root_directory ? normalizePath(connection.root_directory) : "/";
    loadDirectory(startPath);
  }, [connection]);

  const handleSelectFile = async (file: { key: string; isDir: boolean }) => {
    console.log("[FTPFileExplorer] Selected file:", file);
    if (!file.isDir) {
      setCurrentFilePath(file.key);
    } else {
      console.log("[FTPFileExplorer] Loading directory from select:", file.key);
      loadDirectory(file.key);
    }
  };

  const handleNavigate = (path: string) => {
    console.log("[FTPFileExplorer] Navigating to:", path);
    loadDirectory(path);
  };

  const getFileLanguage = () => {
    if (!currentFilePath) return "plaintext";
    return getLanguageFromFileName(currentFilePath) || "plaintext";
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
        <div className="w-full md:w-1/2 p-4 border-r border-ezgray-dark overflow-auto">
          <FTPFileList
            currentPath={currentPath}
            files={files}
            onNavigate={handleNavigate}
            onSelectFile={handleSelectFile}
            isLoading={isLoading}
          />
        </div>

        <div className="w-full md:w-1/2 p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-md font-semibold text-ezwhite">
              {currentFilePath ? currentFilePath.split('/').pop() || 'File Content' : 'File Content'}
            </h3>
            {currentFilePath && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={saveContent}
                disabled={isSaving || !hasUnsavedChanges}
                className="flex items-center gap-1"
              >
                <Save size={16} />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            )}
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
            <div className="h-[calc(100vh-300px)] border border-ezgray-dark rounded">
              <CodeEditor
                content={fileContent}
                language={getFileLanguage()}
                onChange={updateContent}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FTPFileExplorer;
