
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle, 
  DrawerFooter,
  DrawerClose
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Folder, 
  File, 
  ChevronRight, 
  Upload,
  Download,
  Trash2,
  Loader
} from "lucide-react";
import { format } from "date-fns";
import { formatFileSize } from "@/lib/utils";

interface FileItem {
  name: string;
  type: 'file' | 'directory';
  size: number;
  date: Date;
  rawModifiedAt?: string;
}

interface FTPFileExplorerProps {
  connection: any;
  onClose: () => void;
}

const FTPFileExplorer = ({ connection, onClose }: FTPFileExplorerProps) => {
  const [currentPath, setCurrentPath] = useState(connection.root_directory || '/');
  const [pathHistory, setPathHistory] = useState<string[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  useEffect(() => {
    fetchFiles(currentPath);
  }, [currentPath]);

  const fetchFiles = async (path: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${window.location.origin}/api/ftp-connect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          host: connection.host,
          port: connection.port,
          username: connection.username,
          password: connection.password,
          path: path
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch files');
      }

      const data = await response.json();
      
      if (data.success && Array.isArray(data.files)) {
        const formattedFiles = data.files.map((file: any) => ({
          name: file.name,
          type: file.isDirectory ? 'directory' : 'file',
          size: file.size || 0,
          date: new Date(file.modifiedAt || Date.now()),
          rawModifiedAt: file.modifiedAt
        }));
        
        // Sort directories first, then files alphabetically
        const sortedFiles = formattedFiles.sort((a: FileItem, b: FileItem) => {
          if (a.type === 'directory' && b.type !== 'directory') return -1;
          if (a.type !== 'directory' && b.type === 'directory') return 1;
          return a.name.localeCompare(b.name);
        });
        
        setFiles(sortedFiles);
      } else {
        throw new Error(data.error || 'No files returned');
      }
    } catch (error: any) {
      toast.error(`Error fetching files: ${error.message}`);
      console.error('FTP file fetch error:', error);
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToDirectory = (dirName: string) => {
    setPathHistory([...pathHistory, currentPath]);
    
    let newPath;
    if (dirName === '..') {
      // Go up one level
      const pathParts = currentPath.split('/').filter(Boolean);
      pathParts.pop();
      newPath = pathParts.length === 0 ? '/' : ('/' + pathParts.join('/') + '/');
    } else {
      // Go into directory
      newPath = currentPath.endsWith('/') 
        ? `${currentPath}${dirName}/` 
        : `${currentPath}/${dirName}/`;
    }
    
    setCurrentPath(newPath);
  };

  const buildBreadcrumbs = () => {
    const parts = currentPath.split('/').filter(Boolean);
    
    return (
      <div className="flex items-center flex-wrap">
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-auto py-1 px-2" 
          onClick={() => setCurrentPath('/')}
        >
          Root
        </Button>
        
        {parts.map((part, i) => (
          <div key={i} className="flex items-center">
            <ChevronRight className="h-4 w-4 mx-1" />
            <Button
              variant="ghost"
              size="sm"
              className="h-auto py-1 px-2"
              onClick={() => {
                const path = '/' + parts.slice(0, i + 1).join('/') + '/';
                setCurrentPath(path);
              }}
            >
              {part}
            </Button>
          </div>
        ))}
      </div>
    );
  };

  const handleFileAction = (action: 'download' | 'delete', file: FileItem) => {
    // This would be implemented to handle file operations
    toast.info(`${action} functionality to be implemented for ${file.name}`);
  };

  return (
    <DrawerContent className="h-[85vh] max-h-[85vh]">
      <DrawerHeader>
        <DrawerTitle className="flex items-center justify-between">
          <div className="flex-1 truncate">
            Files: {connection.server_name}
          </div>
          <Badge className="bg-ezblue text-xs">Beta</Badge>
        </DrawerTitle>
      </DrawerHeader>
      
      <div className="px-4 mb-4">
        {buildBreadcrumbs()}
      </div>
      
      <div className="px-4 overflow-y-auto flex-1 h-full max-h-[calc(85vh-10rem)]">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader className="h-6 w-6 animate-spin mr-2" />
            <span>Loading files...</span>
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-ezgray">No files in this directory</p>
          </div>
        ) : (
          <div className="space-y-1">
            {/* Up directory button */}
            {currentPath !== '/' && (
              <div 
                className="flex items-center p-2 hover:bg-eznavy-light rounded-md cursor-pointer"
                onClick={() => navigateToDirectory('..')}
              >
                <Folder className="h-5 w-5 mr-2 text-ezblue" />
                <span>..</span>
              </div>
            )}
            
            {/* File list */}
            {files.map((file) => (
              <div 
                key={file.name}
                className={`flex items-center justify-between p-2 hover:bg-eznavy-light rounded-md ${
                  selectedFile === file.name ? 'bg-eznavy-light' : ''
                }`}
                onClick={() => setSelectedFile(file.name === selectedFile ? null : file.name)}
              >
                <div 
                  className="flex items-center flex-1 min-w-0"
                  onDoubleClick={() => file.type === 'directory' && navigateToDirectory(file.name)}
                >
                  {file.type === 'directory' ? (
                    <Folder className="h-5 w-5 mr-2 text-ezblue" />
                  ) : (
                    <File className="h-5 w-5 mr-2 text-ezgray" />
                  )}
                  <div className="truncate flex-1">
                    <p className="truncate">{file.name}</p>
                    <div className="flex items-center text-xs text-ezgray">
                      {file.type === 'file' && (
                        <span className="mr-2">{formatFileSize(file.size)}</span>
                      )}
                      <span>{format(file.date, 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                </div>
                
                {selectedFile === file.name && file.type === 'file' && (
                  <div className="flex space-x-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFileAction('download', file);
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-red-500 hover:text-red-600" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFileAction('delete', file);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Separator className="my-2" />
      
      <DrawerFooter>
        <div className="flex justify-between">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Upload Files
          </Button>
          <DrawerClose asChild>
            <Button variant="ghost" onClick={onClose}>Close</Button>
          </DrawerClose>
        </div>
      </DrawerFooter>
    </DrawerContent>
  );
};

export default FTPFileExplorer;
