
import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TreeItem } from "@/components/tree/TreeItem";
import { useFileTree } from "@/hooks/use-file-tree";
import { Loader, Wifi, WifiOff, AlertCircle } from "lucide-react";
import { ModeToggle } from "./ModeToggle";
import { mcpFtp } from "@/lib/mcpFtp";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface FileTreeWithModeToggleProps {
  connection: {
    id: string;
    server_name?: string;
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

export function FileTreeWithModeToggle({ 
  connection, 
  onSelectFile, 
  activeFilePath,
  initialMode = 'local',
  onModeChange 
}: FileTreeWithModeToggleProps) {
  const [mode, setMode] = useState<'local' | 'ftp'>(initialMode);
  const [ftpData, setFtpData] = useState<any[]>([]);
  const [isLoadingFtp, setIsLoadingFtp] = useState(false);
  const [ftpError, setFtpError] = useState<string | null>(null);
  const [ftpConnected, setFtpConnected] = useState(false);

  // Use the local file tree hook - disable when in FTP mode
  const { 
    treeData, 
    isLoading: isLoadingLocal, 
    error: localError,
    toggleDirectory,
    refreshDirectory 
  } = useFileTree({ 
    connection,
    disabled: mode === 'ftp' 
  });

  // Handle mode change
  const handleModeChange = (newMode: 'local' | 'ftp') => {
    console.log(`[FileTreeWithModeToggle] Switching to ${newMode} mode`);
    setMode(newMode);
    
    if (onModeChange) {
      onModeChange(newMode);
    }
    
    setFtpError(null);
    
    if (newMode === 'ftp') {
      connectToFtp();
    } else {
      setFtpConnected(false);
    }
  };

  // Connect to FTP server
  const connectToFtp = async () => {
    if (!connection) {
      console.error('[FileTreeWithModeToggle] No connection provided');
      setFtpError('No FTP connection available');
      return;
    }
    
    try {
      setIsLoadingFtp(true);
      setFtpError(null);
      
      console.log(`[FileTreeWithModeToggle] Connecting to FTP: ${connection.host}:${connection.port}`);
      
      // Check if MCP is available
      if (typeof window === 'undefined' || !window.mcp?.ftp) {
        console.warn('[FileTreeWithModeToggle] MCP FTP not available, using fallback');
        // Fallback to mock data for development
        setFtpData([
          { name: 'index.html', path: '/index.html', isFolder: false, isDirectory: false },
          { name: 'css', path: '/css/', isFolder: true, isDirectory: true },
          { name: 'js', path: '/js/', isFolder: true, isDirectory: true },
          { name: 'images', path: '/images/', isFolder: true, isDirectory: true }
        ]);
        setFtpConnected(true);
        toast.success("FTP mode enabled (mock data)");
        return;
      }
      
      const connected = await mcpFtp.setCredentials({
        host: connection.host,
        port: connection.port || 21,
        username: connection.username,
        password: connection.password,
        rootDirectory: '/'
      });
      
      if (connected) {
        await loadFtpDirectory('/');
        setFtpConnected(true);
        toast.success("FTP site connected");
      } else {
        const error = mcpFtp.getConnectionError();
        console.error('[FileTreeWithModeToggle] FTP connection failed:', error);
        setFtpError(error || 'Failed to connect to FTP server');
        toast.error("Error: Could not connect to server");
      }
    } catch (error: any) {
      console.error('[FileTreeWithModeToggle] FTP connection error:', error);
      setFtpError(error.message || 'Failed to connect to FTP server');
      toast.error(`Error: Could not connect to server - ${error.message}`);
    } finally {
      setIsLoadingFtp(false);
    }
  };

  // Load FTP directory
  const loadFtpDirectory = async (path: string) => {
    try {
      setIsLoadingFtp(true);
      setFtpError(null);
      
      console.log(`[FileTreeWithModeToggle] Loading FTP directory: ${path}`);
      
      const files = await mcpFtp.listDirectory(path);
      
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
    } catch (error: any) {
      console.error('[FileTreeWithModeToggle] Failed to load FTP directory:', error);
      setFtpError(error.message || 'Failed to load directory');
      toast.error(`Error loading directory: ${error.message}`);
    } finally {
      setIsLoadingFtp(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (path: string) => {
    console.log(`[FileTreeWithModeToggle] File selected: ${path} (mode: ${mode})`);
    onSelectFile(path);
  };

  // Handle directory toggle
  const handleDirectoryToggle = async (node: any) => {
    if (mode === 'local') {
      toggleDirectory(node.path);
    } else {
      await loadFtpDirectory(node.path);
    }
  };

  // Retry connection
  const handleRetryConnection = () => {
    if (mode === 'ftp') {
      connectToFtp();
    } else {
      refreshDirectory();
    }
  };

  const isLoading = mode === 'local' ? isLoadingLocal : isLoadingFtp;
  const error = mode === 'local' ? localError : ftpError;
  const displayData = mode === 'local' ? treeData : ftpData;

  return (
    <div className="h-full flex flex-col">
      <div className="p-2 border-b flex justify-between items-center bg-background">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium">Files</h3>
          {mode === 'ftp' && (
            ftpConnected ? (
              <Wifi className="h-4 w-4 text-green-500" title="FTP Connected" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" title="FTP Disconnected" />
            )
          )}
        </div>
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
              <span className="ml-2 text-sm">
                {mode === 'ftp' ? 'Connecting to FTP...' : 'Loading files...'}
              </span>
            </div>
          ) : error ? (
            <div className="text-center py-6 text-red-500 text-sm p-2">
              <AlertCircle className="h-6 w-6 mx-auto mb-2" />
              <p className="mb-2 font-medium">Error loading files</p>
              <p className="mb-3 text-xs">{error}</p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRetryConnection}
              >
                Retry Connection
              </Button>
            </div>
          ) : displayData.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <p className="text-sm">No files found</p>
              {mode === 'ftp' && (
                <p className="text-xs mt-1">Check your FTP connection</p>
              )}
            </div>
          ) : (
            <ul className="pl-2 space-y-1 max-h-full">
              {displayData.map((node) => (
                <TreeItem
                  key={node.path}
                  node={node}
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
