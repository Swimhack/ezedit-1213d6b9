
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  RefreshCcw, 
  FolderPlus, 
  FilePlus, 
  Upload, 
  Home,
  ArrowLeft
} from "lucide-react";
import { FtpConnection } from "@/hooks/use-ftp-connections";
import { toast } from "sonner";

interface FileBrowserToolbarProps {
  currentPath: string;
  connection: FtpConnection | null;
  onCreateFolder?: () => void;
  onCreateFile?: () => void;
  onUploadFile?: () => void;
  onNavigateHome?: () => void;
  onNavigateUp?: () => void;
  onRefresh?: () => void;
  showNavigationButtons?: boolean;
  isRefreshing?: boolean;
}

export function FileBrowserToolbar({
  currentPath,
  connection,
  onCreateFolder,
  onCreateFile,
  onUploadFile,
  onNavigateHome,
  onNavigateUp,
  onRefresh,
  showNavigationButtons = true,
  isRefreshing = false
}: FileBrowserToolbarProps) {
  const [isRefreshingLocal, setIsRefreshingLocal] = useState(false);
  
  // Handle refresh click with local loading state
  const handleRefresh = async () => {
    if (!onRefresh || isRefreshingLocal) return;
    
    setIsRefreshingLocal(true);
    try {
      await onRefresh();
      toast.success("Files refreshed from server");
    } catch (error) {
      console.error("Refresh error:", error);
      // Error toast is already handled in the parent component
    } finally {
      setIsRefreshingLocal(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {showNavigationButtons && (
        <>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={onNavigateHome}
            disabled={!connection || currentPath === '/' || isRefreshing}
            title="Go to root directory"
          >
            <Home className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="outline" 
            size="icon" 
            onClick={onNavigateUp}
            disabled={!connection || currentPath === '/' || isRefreshing}
            title="Go up one directory"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <div className="h-6 border-l border-ezgray-dark mx-1"></div>
        </>
      )}
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleRefresh}
        disabled={!connection || isRefreshing || isRefreshingLocal}
        title="Refresh files from server"
        className="flex items-center gap-1"
      >
        <RefreshCcw 
          className={`h-4 w-4 ${isRefreshing || isRefreshingLocal ? 'animate-spin' : ''}`} 
        />
        <span className="hidden sm:inline">Refresh Files</span>
      </Button>
      
      <div className="h-6 border-l border-ezgray-dark mx-1"></div>
      
      {onCreateFolder && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onCreateFolder}
          disabled={!connection || isRefreshing}
          title="Create folder"
          className="flex items-center gap-1"
        >
          <FolderPlus className="h-4 w-4" />
          <span className="hidden sm:inline">New Folder</span>
        </Button>
      )}
      
      {onCreateFile && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onCreateFile}
          disabled={!connection || isRefreshing}
          title="Create file"
          className="flex items-center gap-1"
        >
          <FilePlus className="h-4 w-4" />
          <span className="hidden sm:inline">New File</span>
        </Button>
      )}
      
      {onUploadFile && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onUploadFile}
          disabled={!connection || isRefreshing}
          title="Upload file"
          className="flex items-center gap-1"
        >
          <Upload className="h-4 w-4" />
          <span className="hidden sm:inline">Upload</span>
        </Button>
      )}
    </div>
  );
}
