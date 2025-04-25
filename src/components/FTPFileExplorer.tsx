import { useState, useEffect } from "react";
import { toast } from "sonner";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { FileItem } from "@/types/ftp";
import { supabase } from "@/integrations/supabase/client";
import Editor from "@monaco-editor/react";

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
  const [fileList, setFileList] = useState<FileItem[]>([]);
  const [currentPath, setCurrentPath] = useState<string>("/");
  const [isLoading, setIsLoading] = useState(false);
  const [editorValue, setEditorValue] = useState("");
  const [currentFilePath, setCurrentFilePath] = useState("");
  const [isEditorLoading, setIsEditorLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const listDirectory = async (path: string = "/") => {
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setFileList(data.files);
        setCurrentPath(path);
      } else {
        toast.error(`Failed to list directory: ${data.message}`);
      }
    } catch (error: any) {
      toast.error(`Error listing directory: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileClick = async (file: FileItem) => {
    if (file.isDirectory) {
      await listDirectory(currentPath === "/" ? `/${file.name}` : `${currentPath}/${file.name}`);
    } else {
      setIsEditorLoading(true);
      setCurrentFilePath(currentPath === "/" ? `/${file.name}` : `${currentPath}/${file.name}`);
      try {
        const response = await fetch(`https://natjhcqynqziccssnwim.supabase.co/functions/v1/ftp-download-file`, {
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
            path: currentPath === "/" ? `/${file.name}` : `${currentPath}/${file.name}`
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.success) {
          setEditorValue(atob(data.content));
        } else {
          toast.error(`Failed to download file: ${data.message}`);
        }
      } catch (error: any) {
        toast.error(`Error downloading file: ${error.message}`);
      } finally {
        setIsEditorLoading(false);
      }
    }
  };

  const handleSave = async () => {
    setIsPublishing(true);
    try {
      const response = await fetch(`https://natjhcqynqziccssnwim.supabase.co/functions/v1/ftp-upload-file`, {
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
          path: currentFilePath,
          content: btoa(editorValue)
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message);
      }
      toast.success("File saved successfully!");
    } catch (error: any) {
      toast.error(`Failed to save file: ${error.message}`);
    } finally {
      setIsPublishing(false);
    }
  };

  useEffect(() => {
    if (connection) {
      listDirectory();
    }
  }, [connection]);

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
          <h3 className="text-md font-semibold text-ezwhite mb-2">Files at: {currentPath}</h3>
          <ScrollArea className="rounded-md border border-ezgray-dark h-[calc(100vh-200px)]">
            {isLoading ? (
              <div className="p-4 text-center text-ezgray">Loading files...</div>
            ) : (
              <div className="p-2">
                {fileList.map((file) => (
                  <div
                    key={file.name}
                    className="flex items-center justify-between p-2 rounded hover:bg-eznavy cursor-pointer"
                    onClick={() => handleFileClick(file)}
                  >
                    <span className="text-ezwhite">{file.name}</span>
                    <span className="text-ezgray text-sm">{file.isDirectory ? "Directory" : `${file.size} bytes`}</span>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        <div className="w-full md:w-1/2 p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-md font-semibold text-ezwhite">File Content</h3>
            <Button 
              onClick={handleSave}
              disabled={!currentFilePath || isPublishing} 
              className="bg-ezblue hover:bg-ezblue/90"
            >
              {isPublishing ? 'Saving...' : 'Save'}
            </Button>
          </div>
          {isEditorLoading ? (
            <div className="text-ezgray">Loading editor...</div>
          ) : (
            <Editor
              height="calc(100vh - 200px)"
              theme="vs-dark"
              value={editorValue}
              onChange={setEditorValue}
              options={{
                wordWrap: "on",
                minimap: { enabled: false },
                automaticLayout: true,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default FTPFileExplorer;
