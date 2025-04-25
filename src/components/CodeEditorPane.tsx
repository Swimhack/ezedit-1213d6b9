
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Save, Check, FileCode2 } from "lucide-react";
import Editor from "@monaco-editor/react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { DiffModal } from "@/components/DiffModal";

interface CodeEditorPaneProps {
  connection: {
    id: string;
    server_name: string;
    host: string;
    port: number;
    username: string;
    password: string;
  } | null;
  filePath: string;
  onContentChange: (content: string) => void;
}

export default function CodeEditorPane({ connection, filePath, onContentChange }: CodeEditorPaneProps) {
  const [editorContent, setEditorContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState<string>("javascript");
  const [isSaving, setIsSaving] = useState(false);
  const [isDiffModalOpen, setIsDiffModalOpen] = useState(false);
  const [remoteCode, setRemoteCode] = useState<string>("");
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    if (filePath && connection) {
      fetchFileContent();
    }
  }, [filePath, connection]);

  useEffect(() => {
    if (filePath) {
      // Auto-detect language by file extension
      const extension = filePath.split('.').pop()?.toLowerCase();
      switch (extension) {
        case 'js':
          setLanguage('javascript');
          break;
        case 'jsx':
          setLanguage('javascript');
          break;
        case 'ts':
          setLanguage('typescript');
          break;
        case 'tsx':
          setLanguage('typescript');
          break;
        case 'html':
          setLanguage('html');
          break;
        case 'css':
          setLanguage('css');
          break;
        case 'json':
          setLanguage('json');
          break;
        case 'md':
          setLanguage('markdown');
          break;
        case 'php':
          setLanguage('php');
          break;
        case 'py':
          setLanguage('python');
          break;
        default:
          setLanguage('plaintext');
      }
    }
  }, [filePath]);

  const fetchFileContent = async () => {
    if (!connection || !filePath) return;
    
    setIsLoading(true);
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
          path: filePath
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        const content = atob(data.content);
        setEditorContent(content);
        onContentChange(content);
      } else {
        toast.error(`Failed to download file: ${data.message}`);
      }
    } catch (error: any) {
      toast.error(`Error downloading file: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setEditorContent(value);
      onContentChange(value);
    }
  };

  const handleSaveClick = async () => {
    if (!connection || !filePath) {
      toast.error("No file selected");
      return;
    }

    setIsSaving(true);
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
          path: filePath
        }),
      });

      const data = await response.json();
      if (data.success) {
        setRemoteCode(atob(data.content));
        setIsDiffModalOpen(true);
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast.error(`Failed to fetch remote file: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishChanges = async () => {
    if (!connection || !filePath) return;
    
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
          path: filePath,
          content: btoa(editorContent)
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("File saved successfully!");
        setIsDiffModalOpen(false);
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast.error(`Failed to save file: ${error.message}`);
    } finally {
      setIsPublishing(false);
    }
  };

  const beautifyCode = () => {
    // Simple beautify function, can be enhanced with proper formatters
    try {
      let formattedCode;
      
      // Basic JSON formatting
      if (language === 'json') {
        const jsonObj = JSON.parse(editorContent);
        formattedCode = JSON.stringify(jsonObj, null, 2);
        setEditorContent(formattedCode);
        onContentChange(formattedCode);
        toast.success("Code beautified");
      } else {
        toast.info("Beautify currently supports JSON only");
      }
    } catch (error: any) {
      toast.error(`Beautify failed: ${error.message}`);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 border-b border-ezgray-dark">
        <div className="flex items-center space-x-2">
          <FileCode2 size={16} />
          <span className="text-sm truncate">
            {filePath ? filePath : "No file selected"}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={beautifyCode}
            disabled={!filePath || isLoading}
            title="Beautify Code"
          >
            <Sparkles size={16} />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleSaveClick}
            disabled={!filePath || isLoading || isSaving}
            title="Save File"
          >
            <Save size={16} />
          </Button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-ezblue"></div>
          </div>
        ) : !filePath ? (
          <div className="flex flex-col items-center justify-center h-full text-ezgray">
            <FileCode2 size={48} className="mb-2" />
            <p>Select a file from the file tree to edit</p>
          </div>
        ) : (
          <Editor
            height="100%"
            language={language}
            theme="vs-dark"
            value={editorContent}
            onChange={handleEditorChange}
            options={{
              wordWrap: "on",
              minimap: { enabled: false },
              automaticLayout: true,
            }}
          />
        )}
      </div>

      {/* Diff Modal */}
      <DiffModal
        isOpen={isDiffModalOpen}
        onClose={() => setIsDiffModalOpen(false)}
        onConfirm={handlePublishChanges}
        remoteCode={remoteCode}
        localCode={editorContent}
        isLoading={isPublishing}
      />
    </div>
  );
}
