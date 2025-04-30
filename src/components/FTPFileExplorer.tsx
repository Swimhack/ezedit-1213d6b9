
import { useState, useEffect } from "react";
import { FileExplorerHeader } from "./ftp-explorer/FileExplorerHeader";
import { FileEditorToolbar } from "./ftp-explorer/FileEditorToolbar";
import { FileEditorContent } from "./ftp-explorer/FileEditorContent";
import { listDir } from "@/lib/ftp";
import { toast } from "sonner";
import { normalizePath } from "@/utils/path";
import { FTPFileList } from "./FTPFileList";
import { useFileContent } from "@/hooks/use-file-content";
import { useSubscription } from "@/hooks/useSubscription";
import { useSuperAdmin } from "@/hooks/useSuperAdmin";
import { AlertCircle, Lock } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

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
  const [showKlein, setShowKlein] = useState(true);
  const navigate = useNavigate();

  const { 
    content: fileContent, 
    isLoading: isFileLoading,
    updateContent,
    saveContent,
    isSaving,
    hasUnsavedChanges,
  } = useFileContent({ connection, filePath: currentFilePath });

  const [userEmail, setUserEmail] = useState<string | null>(null);
  useEffect(() => {
    const getUserEmail = async () => {
      const { data } = await supabase.auth.getSession();
      setUserEmail(data.session?.user?.email || null);
    };
    getUserEmail();
  }, []);

  const { subscribed, subscriptionTier, isLoading: subLoading } = useSubscription(userEmail);
  const { isSuperAdmin } = useSuperAdmin(userEmail);
  
  // Check if user can edit files
  const canEditFiles = isSuperAdmin || subscribed || subscriptionTier === 'business_pro';

  useEffect(() => {
    const checkScreenSize = () => {
      setShowKlein(window.innerWidth >= 1024);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const loadDirectory = async (path: string) => {
    setIsLoading(true);
    try {
      const normalizedPath = normalizePath(path);
      const result = await listDir(connection.id, normalizedPath);
      if (result && result.data && result.data.files) {
        setFiles(result.data.files);
        setCurrentPath(normalizedPath);
      } else {
        console.error("[FTPFileExplorer] Invalid response format:", result);
        toast.error("Failed to load directory: Invalid response format");
      }
    } catch (error: any) {
      console.error("[FTPFileExplorer] Directory loading error:", error);
      toast.error(`Failed to load directory: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const startPath = connection.root_directory ? normalizePath(connection.root_directory) : "/";
    loadDirectory(startPath);
  }, [connection]);

  const handleSelectFile = async (file: { key: string; isDir: boolean }) => {
    if (!file.isDir) {
      setCurrentFilePath(file.key);
    } else {
      loadDirectory(file.key);
    }
  };

  const handleNavigate = (path: string) => {
    loadDirectory(path);
  };

  const handleApplyResponse = (text: string) => {
    if (!canEditFiles) {
      toast.error("Editing requires a paid subscription");
      return;
    }
    
    if (fileContent) {
      const newContent = fileContent + '\n' + text;
      updateContent(newContent);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <FileExplorerHeader 
        serverName={connection.server_name} 
        onClose={onClose} 
      />

      <div className="flex flex-col md:flex-row flex-1 h-[calc(100vh-8rem)] overflow-hidden">
        <div className="w-full md:w-1/3 border-r border-ezgray-dark flex flex-col overflow-hidden">
          <div className="p-3 border-b border-ezgray-dark">
            <h3 className="text-sm font-medium text-ezwhite">File Browser</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            <FTPFileList
              currentPath={currentPath}
              files={files}
              onNavigate={handleNavigate}
              onSelectFile={handleSelectFile}
              isLoading={isLoading}
            />
          </div>
        </div>

        <div className="w-full md:w-2/3 flex-1 flex flex-col">
          <FileEditorToolbar
            fileName={currentFilePath}
            onSave={canEditFiles ? saveContent : () => toast.error("Editing requires a paid subscription")}
            isSaving={isSaving}
            hasUnsavedChanges={hasUnsavedChanges}
            disabled={!canEditFiles}
          />
          
          {isFileLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-ezblue"></div>
            </div>
          ) : !canEditFiles && currentFilePath ? (
            <div className="flex flex-col items-center justify-center h-full p-6">
              <div className="bg-eznavy-light rounded-lg p-6 max-w-md text-center">
                <Lock size={48} className="mx-auto text-ezblue mb-4" />
                <h3 className="text-xl font-semibold text-ezwhite mb-2">Editing Requires Subscription</h3>
                <p className="text-ezgray mb-4">
                  The free trial only allows viewing files. Upgrade to our Business Pro plan to edit files.
                </p>
                <Button 
                  className="bg-ezblue hover:bg-ezblue-light text-ezwhite"
                  onClick={() => navigate('/pricing')}
                >
                  View Pricing Plans
                </Button>
              </div>
            </div>
          ) : (
            <FileEditorContent
              filePath={currentFilePath}
              content={fileContent || ''}
              showKlein={showKlein}
              onContentChange={canEditFiles ? updateContent : () => {}}
              onApplyResponse={handleApplyResponse}
              readOnly={!canEditFiles}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default FTPFileExplorer;
