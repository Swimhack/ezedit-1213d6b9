
import { ScrollArea } from "@/components/ui/scroll-area";
import { TreeItem } from "@/components/tree/TreeItem";
import { useFileTree } from "@/hooks/use-file-tree";
import { Loader } from "lucide-react";
import { useState, useEffect } from "react";
import { mcpFtp } from "@/lib/mcpFtp";
import { toast } from "sonner";
import { ModeToggle } from "./ModeToggle";

interface FileTreeProps {
  connection: {
    id: string;
    server_name: string;
    host: string;
    port: number;
    username: string;
    password: string;
  };
  onSelectFile: (path: string) => void;
  activeFilePath?: string;
  initialMode?: 'local' | 'ftp';
  onModeChange?: (mode: 'local' | 'ftp') => void;
}

export default function FileTree({ 
  connection, 
  onSelectFile, 
  activeFilePath,
  initialMode = 'local',
  onModeChange 
}: FileTreeProps) {
  const [mode, setMode] = useState<'local' | 'ftp'>(initialMode);
  const [ftpData, setFtpData] = useState<any[]>([]);
  const [isLoadingFtp, setIsLoadingFtp] = useState(false);
  const [ftpError, setFtpError] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState<string>('/');

  // Use the local file tree hook for local mode
  const { treeData, isLoading: isLoadingLocal, toggleDirectory } = useFileTree({ 
    connection,
    disabled: mode === 'ftp' 
  });

  // Handle mode change
  const handleModeChange = (newMode: 'local' | 'ftp') => {
    setMode(newMode);
    if (onModeChange) {
      onModeChange(newMode);
    }
    
    // Reset state when changing modes
    setFtpError(null);
    
    // If switching to FTP mode, connect to the FTP server
    if (newMode === 'ftp') {
      connectToFtp();
    }
  };

  // Connect to FTP server when switching to FTP mode
  const connectToFtp = async () => {
    if (!connection) return;
    
    try {
      setIsLoadingFtp(true);
      setFtpError(null);
      
      const connected = await mcpFtp.setCredentials({
        host: connection.host,
        port: connection.port || 21,
        username: connection.username,
        password: connection.password,
        rootDirectory: '/'
      });
      
      if (connected) {
        // Load the root directory
        await loadFtpDirectory('/');
      } else {
        setFtpError(`Failed to connect: ${mcpFtp.getConnectionError()}`);
      }
    } catch (error: any) {
      console.error('[FileTree] FTP connection error:', error);
      setFtpError(error.message || 'Failed to connect to FTP server');
    } finally {
      setIsLoadingFtp(false);
    }
  };

  // Load FTP directory
  const loadFtpDirectory = async (path: string) => {
    try {
      setIsLoadingFtp(true);
      setFtpError(null);
      
      const files = await mcpFtp.listDirectory(path);
      
      // Transform the files into the tree data format
      const treeData = files.map(file => ({
        name: file.name,
        path: file.path,
        isFolder: file.isDirectory,
        isOpen: false,
        isLoaded: false,
        children: [],
        size: file.size,
        modified: file.modifiedDate,
        isDirectory: file.isDirectory
      }));
      
      setFtpData(treeData);
      setCurrentPath(path);
    } catch (error: any) {
      console.error('[FileTree] Failed to load FTP directory:', error);
      setFtpError(error.message || 'Failed to load directory');
      toast.error(`Failed to load directory: ${error.message}`);
    } finally {
      setIsLoadingFtp(false);
    }
  };

  // Toggle FTP directory
  const toggleFtpDirectory = async (path: string, isOpen: boolean) => {
    // If the directory is already open, we're closing it - no need to load anything
    if (!isOpen) {
      await loadFtpDirectory(path);
    }
  };

  // Handle file selection
  const handleFileSelect = (path: string) => {
    onSelectFile(path);
  };

  // Handle directory toggle based on the current mode
  const handleDirectoryToggle = async (node: any) => {
    if (mode === 'local') {
      toggleDirectory(node);
    } else {
      await toggleFtpDirectory(node.path, node.isOpen);
    }
  };

  // Initialize FTP connection when component mounts and mode is ftp
  useEffect(() => {
    if (mode === 'ftp' && connection) {
      connectToFtp();
    }
  }, [connection, mode]);

  const isLoading = mode === 'local' ? isLoadingLocal : isLoadingFtp;
  const error = mode === 'ftp' ? ftpError : null;
  const displayData = mode === 'local' ? treeData : ftpData;

  return (
    <div className="h-full flex flex-col">
      <div className="p-2 border-b flex justify-between items-center">
        <h3 className="text-sm font-medium">Files</h3>
        <ModeToggle 
          mode={mode} 
          onModeChange={handleModeChange} 
          disabled={isLoading}
        />
      </div>
      
      <ScrollArea className="flex-1 overflow-y-auto">
        <div className="pr-2">
          {isLoading ? (
            <div className="flex justify-center items-center h-20">
              <Loader className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-6 text-red-500 text-sm p-2">
              <p className="mb-2 font-medium">Error loading files</p>
              <p>{error}</p>
              <button 
                className="mt-3 px-3 py-1 bg-primary text-primary-foreground text-xs rounded-md"
                onClick={() => mode === 'ftp' ? connectToFtp() : null}
              >
                Retry Connection
              </button>
            </div>
          ) : displayData.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No files found
            </div>
          ) : (
            <ul className="pl-2 space-y-1 max-h-full">
              {displayData.map((node) => (
                <TreeItem
                  key={node.path}
                  node={{
                    name: node.name,
                    path: node.path,
                    isFolder: node.isFolder,
                    isOpen: node.isOpen,
                    isLoaded: node.isLoaded,
                    children: node.children,
                    size: node.size,
                    modified: node.modified,
                    isDirectory: node.isDirectory || node.isFolder // Ensure compatibility with both types
                  }}
                  activeFilePath={activeFilePath}
                  onToggle={handleDirectoryToggle}
                  onSelectFile={handleFileSelect}
                />
              ))}
            </ul>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
