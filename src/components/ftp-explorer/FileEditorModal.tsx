
import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Editor from "@monaco-editor/react";
import Split from "react-split";
import { ClineChatDrawer } from "./ClineChatDrawer";
import { useLivePreview } from "@/hooks/useLivePreview";
import { FileEditorToolbar } from "./FileEditorToolbar";
import { getFile, saveFile } from "@/lib/ftp";
import { toast } from "sonner";
import SplitHandle from "./SplitHandle";

interface FileEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  connectionId: string;
  filePath: string;
}

export function FileEditorModal({
  isOpen,
  onClose,
  connectionId,
  filePath,
}: FileEditorModalProps) {
  const [code, setCode] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const editorRef = useRef<any>(null);
  
  const previewSrc = useLivePreview(code, filePath || "");
  
  useEffect(() => {
    if (isOpen && connectionId && filePath) {
      loadFile();
    }
  }, [isOpen, connectionId, filePath]);
  
  const loadFile = async () => {
    if (!connectionId || !filePath) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await getFile(connectionId, filePath);
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data && data.content) {
        setCode(data.content);
        setHasUnsavedChanges(false);
      } else {
        throw new Error("Failed to load file content");
      }
    } catch (error: any) {
      console.error("Error loading file:", error);
      setError(error.message || "Failed to load file");
      toast.error(`Error loading file: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSave = async () => {
    if (!connectionId || !filePath || !code) {
      toast.error("Missing data for saving");
      return;
    }
    
    setIsSaving(true);
    
    try {
      const { error } = await saveFile({
        id: connectionId,
        filepath: filePath,
        content: code,
        username: "editor-user"
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      toast.success("File saved successfully");
      setHasUnsavedChanges(false);
    } catch (error: any) {
      console.error("Error saving file:", error);
      toast.error(`Error saving file: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleCodeChange = (newCode: string | undefined) => {
    if (newCode !== undefined && newCode !== code) {
      setCode(newCode);
      setHasUnsavedChanges(true);
    }
  };
  
  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    editor.focus();
  };
  
  const detectLanguage = () => {
    if (!filePath) return "plaintext";
    
    const extension = filePath.split('.').pop()?.toLowerCase();
    const langMap: Record<string, string> = {
      js: "javascript",
      jsx: "javascript",
      ts: "typescript",
      tsx: "typescript",
      html: "html",
      htm: "html",
      css: "css",
      json: "json",
      md: "markdown",
      php: "php",
      py: "python",
      rb: "ruby",
      go: "go",
      java: "java",
      c: "c",
      cpp: "cpp",
      cs: "csharp",
      sql: "sql",
      yml: "yaml",
      yaml: "yaml",
      xml: "xml",
      sh: "shell",
      bash: "shell",
      txt: "plaintext"
    };
    
    return langMap[extension || ""] || "plaintext";
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-screen-xl w-[95vw] h-[90vh] p-0 flex flex-col">
        <FileEditorToolbar
          fileName={filePath}
          onSave={handleSave}
          isSaving={isSaving}
          hasUnsavedChanges={hasUnsavedChanges}
        />
        
        {error ? (
          <div className="flex items-center justify-center h-full p-8">
            <div className="text-center text-red-500">
              <p className="text-xl font-bold">Error</p>
              <p>{error}</p>
              <Button 
                variant="outline" 
                className="mt-4" 
                onClick={loadFile}
              >
                Retry
              </Button>
            </div>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin h-8 w-8 border-4 border-ezblue border-t-transparent rounded-full"></div>
            <span className="ml-3 text-ezblue">Loading file...</span>
          </div>
        ) : (
          <div className="flex flex-col flex-1 overflow-hidden">
            <Split
              direction="vertical"
              sizes={[60, 40]}
              minSize={100}
              gutterSize={8}
              gutter={() => {
                const gutter = document.createElement('div');
                gutter.className = 'split-gutter';
                return gutter;
              }}
              className="h-full"
            >
              <div className="overflow-hidden">
                <Editor
                  height="100%"
                  language={detectLanguage()}
                  theme="vs-dark"
                  value={code}
                  onChange={handleCodeChange}
                  onMount={handleEditorDidMount}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    wordWrap: "on",
                    automaticLayout: true,
                  }}
                />
              </div>
              <div className="overflow-hidden bg-white dark:bg-gray-900">
                <div className="p-2 bg-gray-100 dark:bg-gray-800 text-xs font-mono border-t border-b dark:border-gray-700">
                  Preview
                </div>
                <iframe
                  srcDoc={previewSrc}
                  className="w-full h-[calc(100%-28px)] border-none"
                  sandbox="allow-scripts"
                  title="Preview"
                />
              </div>
            </Split>
            
            <ClineChatDrawer
              filePath={filePath}
              code={code}
              onInsert={setCode}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
