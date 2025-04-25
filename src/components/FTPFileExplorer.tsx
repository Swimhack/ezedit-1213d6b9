
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
import { Badge } from "@/components/ui/badge";
import { FTPFileList } from "./FTPFileList";

interface FileItem {
  name: string;
  type: string;
  size: number;
  modified: string;
  isDirectory: boolean;
}

interface FTPFileExplorerProps {
  connection: any;
  onClose: () => void;
}

const FTPFileExplorer = ({ connection, onClose }: FTPFileExplorerProps) => {
  const [currentPath, setCurrentPath] = useState(connection.root_directory || '/');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFiles = async (path: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`https://natjhcqynqziccssnwim.supabase.co/functions/v1/ftp-list-directory`, {
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
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        setFiles(result.files);
        setCurrentPath(path);
      } else {
        throw new Error(result.message || 'Failed to fetch files');
      }
    } catch (error: any) {
      toast.error(`Error fetching files: ${error.message}`);
      console.error("FTP file fetch error:", error);
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles(currentPath);
  }, []);

  const handleNavigate = (newPath: string) => {
    fetchFiles(newPath);
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

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <FTPFileList
          currentPath={currentPath}
          files={files}
          onNavigate={handleNavigate}
          isLoading={isLoading}
        />
      </div>

      <Separator className="my-2" />
      
      <DrawerFooter>
        <DrawerClose asChild>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </DrawerClose>
      </DrawerFooter>
    </DrawerContent>
  );
};

export default FTPFileExplorer;
