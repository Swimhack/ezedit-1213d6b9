
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { useState } from "react";
import { getLanguageFromFileName } from "@/utils/language-detector";

interface SplitEditorProps {
  fileName: string | null;
  content: string;
  onChange: (content: string) => void;
  editorRef?: React.MutableRefObject<any>;
}

export function SplitEditor({ fileName, content, onChange, editorRef }: SplitEditorProps) {
  const [iframeKey, setIframeKey] = useState(0);
  
  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      onChange(value);
      // Optionally refresh preview
      setIframeKey(prev => prev + 1);
    }
  };

  const getFileLanguage = () => {
    if (!fileName) return "plaintext";
    return getLanguageFromFileName(fileName) || "plaintext";
  };

  return (
    <ResizablePanelGroup 
      direction="vertical" 
      className="h-full rounded-lg border"
    >
      <ResizablePanel defaultSize={50} minSize={30}>
        <CodeEditor
          content={content}
          language={getFileLanguage()}
          onChange={handleEditorChange}
          editorRef={editorRef}
        />
      </ResizablePanel>
      
      <ResizableHandle withHandle />
      
      <ResizablePanel minSize={30}>
        <div className="relative h-full bg-background">
          <div className="absolute top-0 left-0 w-full bg-muted/20 text-[10px] text-muted-foreground flex select-none border-b">
            {[400, 480, 600, 768, 860, 992, 1200].map(w => (
              <span
                key={w}
                style={{ width: w }}
                className="border-r border-border px-1 text-right"
              >
                {w}px
              </span>
            ))}
          </div>
          {fileName ? (
            <iframe
              key={iframeKey}
              src={fileName}
              className="w-full h-full pt-4 bg-white"
              title="Preview"
              sandbox="allow-same-origin allow-scripts"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No file selected for preview
            </div>
          )}
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
