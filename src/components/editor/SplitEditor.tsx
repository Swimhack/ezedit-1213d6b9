
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { useEffect, useRef, useState } from "react";
import { getLanguageFromFileName } from "@/utils/language-detector";
import debounce from "debounce";

interface SplitEditorProps {
  fileName: string | null;
  content: string;
  onChange: (content: string) => void;
  editorRef?: React.MutableRefObject<any>;
  error?: string;
}

export function SplitEditor({ fileName, content, onChange, editorRef, error }: SplitEditorProps) {
  const [srcDoc, setSrcDoc] = useState("");
  
  // Create debounced change handler to prevent excessive updates
  const debouncedChange = debounce((value: string | undefined) => {
    if (value !== undefined) {
      onChange(value);
    }
  }, 500);

  const getFileLanguage = () => {
    if (!fileName) return "plaintext";
    return getLanguageFromFileName(fileName) || "plaintext";
  };

  // Build preview content whenever content changes
  useEffect(() => {
    if (error) {
      // Display error message in preview with improved styling
      setSrcDoc(`
        <body style="font:16px/1.5 system-ui;padding:2rem;
                     color:#f87171;background:#1e293b">
          <h3 style="margin:0 0 1rem;font:600 18px sans-serif">FTP Error</h3>
          <pre style="white-space:pre-wrap;">${error}</pre>
          <p style="margin-top:1rem;font-size:13px;">Check Dashboard ▸ Functions ▸ Logs</p>
        </body>`);
      return;
    }
    
    if (!content) return;
    
    const isHtmlFile = fileName && /\.(html?|htm)$/i.test(fileName);
    let previewContent = content;
    
    if (!isHtmlFile) {
      // For non-HTML files, wrap content in pre tag for display
      previewContent = `<pre style="white-space:pre-wrap;font-family:monospace;padding:1rem;">${
        content.replace(/[&<>]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]!))
      }</pre>`;
    }
    
    setSrcDoc(previewContent);
  }, [content, fileName, error]);

  console.log(`[SplitEditor] Rendering with fileName: ${fileName}, content length: ${content?.length || 0}`);

  return (
    <ResizablePanelGroup 
      direction="vertical" 
      className="h-full rounded-lg border"
    >
      <ResizablePanel defaultSize={55} minSize={30}>
        <CodeEditor
          content={content || ""}
          language={getFileLanguage()}
          onChange={debouncedChange}
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
          {fileName || error ? (
            <iframe
              srcDoc={srcDoc}
              className="w-full h-full pt-4 bg-white"
              title="Preview"
              sandbox="allow-same-origin allow-scripts allow-forms"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No preview available
            </div>
          )}
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
