
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Save, Loader2, FileCode2 } from "lucide-react";
import Editor from "@monaco-editor/react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

interface CodeEditorPaneProps {
  connection: {
    id: string;
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
  const [isSaving, setIsSaving] = useState(false);
  const [language, setLanguage] = useState<string>("javascript");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (filePath && connection) {
      fetchFileContent();
    }
  }, [filePath, connection]);

  // Warn on unload if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Auto-detect language by file extension
  useEffect(() => {
    if (filePath) {
      const extension = filePath.split('.').pop()?.toLowerCase();
      switch (extension) {
        case 'js':
        case 'jsx':
          setLanguage('javascript');
          break;
        case 'ts':
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
        setHasUnsavedChanges(false);
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
      setHasUnsavedChanges(true);
    }
  };

  const handleSave = async () => {
    if (!connection || !filePath) {
      toast.error("No file selected");
      return;
    }

    setIsSaving(true);
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
        setHasUnsavedChanges(false);
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast.error(`Failed to save file: ${error.message}`);
    } finally {
      setIsSaving(false);
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
            onClick={handleSave}
            disabled={!filePath || isLoading || isSaving || !hasUnsavedChanges}
          >
            {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
          </Button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 relative overflow-hidden">
        {isLoading ? (
          <div className="absolute inset-0 z-10 bg-background/80 backdrop-blur-sm flex items-center justify-center">
            <Loader2 className="animate-spin" size={24} />
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
    </div>
  );
}
