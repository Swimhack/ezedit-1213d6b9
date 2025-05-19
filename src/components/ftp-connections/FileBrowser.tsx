
import { useState, useEffect } from "react";
import { SimpleFTPFileList } from "@/components/SimpleFTPFileList";
import { FileBrowserToolbar } from "@/components/ftp-explorer/FileBrowserToolbar";
import { useFtpFileOperations } from "@/hooks/file-explorer/use-ftp-file-operations";
import { FtpConnection } from "@/hooks/use-ftp-connections";
import { normalizePath } from "@/utils/path";

interface FileBrowserProps {
  connection: FtpConnection | null;
  initialPath?: string;
  onSelectFile?: (file: { key: string; isDir: boolean }) => void;
  onCreateFolder?: () => void;
  onCreateFile?: () => void;
  onUploadFile?: () => void;
}

export function FileBrowser({
  connection,
  initialPath = "/",
  onSelectFile,
  onCreateFolder,
  onCreateFile,
  onUploadFile
}: FileBrowserProps) {
  const [currentPath, setCurrentPath] = useState(initialPath);
  const [files, setFiles] = useState<any[]>([]);
  const { loadDirectory, isLoading, error, refreshDirectoryFromServer } = useFtpFileOperations();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Initial load and path change
  useEffect(() => {
    if (connection?.id) {
      loadAndSetFiles(currentPath);
    }
  }, [connection?.id, currentPath]);

  // Load files
  const loadAndSetFiles = async (path: string) => {
    if (!connection?.id) return;

    try {
      const result = await loadDirectory(connection.id, path);
      setFiles(result.files || []);
    } catch (error) {
      console.error("Error loading files:", error);
    }
  };

  // Navigate to path
  const handleNavigate = (newPath: string) => {
    setCurrentPath(normalizePath(newPath));
  };

  // Navigate up
  const handleNavigateUp = () => {
    if (currentPath === "/" || !currentPath) return;
    const parts = currentPath.split("/").filter(Boolean);
    parts.pop();
    const newPath = parts.length === 0 ? "/" : `/${parts.join("/")}`;
    setCurrentPath(newPath);
  };

  // Navigate to home
  const handleNavigateHome = () => {
    setCurrentPath("/");
  };

  // Force refresh from server
  const handleRefresh = async () => {
    if (!connection?.id) return;
    
    setIsRefreshing(true);
    try {
      const result = await refreshDirectoryFromServer(connection.id, currentPath);
      setFiles(result.files || []);
    } catch (error) {
      console.error("Error refreshing files:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-4">
      <FileBrowserToolbar
        currentPath={currentPath}
        connection={connection}
        onCreateFolder={onCreateFolder}
        onCreateFile={onCreateFile}
        onUploadFile={onUploadFile}
        onNavigateHome={handleNavigateHome}
        onNavigateUp={handleNavigateUp}
        onRefresh={handleRefresh}
        isRefreshing={isLoading || isRefreshing}
      />

      <SimpleFTPFileList
        currentPath={currentPath}
        files={files}
        onNavigate={handleNavigate}
        onSelectFile={onSelectFile}
        isLoading={isLoading || isRefreshing}
        onRefresh={handleRefresh}
      />
      
      {error && (
        <div className="border border-red-300 bg-red-50 p-3 rounded-md text-red-800 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
