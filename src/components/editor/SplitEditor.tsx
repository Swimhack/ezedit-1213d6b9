
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { useEffect, useRef, useState } from "react";
import { getLanguageFromFileName } from "@/utils/language-detector";
import debounce from "debounce";
import { useFileExplorerStore } from "@/store/fileExplorerStore";
import { Toggle } from "@/components/ui/toggle";
import { WysiwygEditor } from "@/components/editor/WysiwygEditor";
import { Bot, Code, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface SplitEditorProps {
  fileName: string | null;
  content: string;
  onChange: (content: string) => void;
  editorRef?: React.MutableRefObject<any>;
  error?: string;
}

export function SplitEditor({ fileName, content, onChange, editorRef, error }: SplitEditorProps) {
  const [srcDoc, setSrcDoc] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const activeConnection = useFileExplorerStore(state => state.activeConnection);
  const baseUrl = activeConnection?.web_url ?? '';
  const [editMode, setEditMode] = useState<'code' | 'wysiwyg'>('code');
  const [wysiwygContent, setWysiwygContent] = useState("");
  const wysiwygRef = useRef<HTMLDivElement>(null);
  
  // If no content is loaded yet, show a loading state
  if (!content || content.length === 0) {
    return <div className="flex items-center justify-center h-full text-slate-400">Loading…</div>;
  }
  
  const debouncedChange = debounce((value: string | undefined) => {
    if (value !== undefined) {
      onChange(value);
      setRefreshKey(k => k + 1); // Refresh preview after content changes
    }
  }, 500);

  const getFileLanguage = () => {
    if (!fileName) return "plaintext";
    return getLanguageFromFileName(fileName) || "plaintext";
  };

  // Initialize WYSIWYG content when switching modes or when content changes
  useEffect(() => {
    if (isHtmlFile() && content) {
      setWysiwygContent(content);
    }
  }, [content, fileName]);

  // Check if the file is HTML or PHP
  const isHtmlFile = () => {
    return fileName ? /\.(html?|htm|php)$/i.test(fileName) : false;
  };

  // Toggle between code and WYSIWYG modes
  const handleToggleMode = (value: string) => {
    if (value === 'wysiwyg' || value === 'code') {
      setEditMode(value);
    }
  };

  // Sync the content between editors
  const syncContent = () => {
    if (editMode === 'wysiwyg') {
      // From WYSIWYG to code
      if (wysiwygRef.current) {
        const htmlContent = wysiwygContent;
        debouncedChange(htmlContent);
      }
    } else {
      // From code to WYSIWYG
      setWysiwygContent(content);
    }
    // Refresh preview after sync
    setRefreshKey(k => k + 1);
  };

  // Update preview when content changes
  useEffect(() => {
    if (error) {
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
    
    const isPreviewableFile = fileName && /\.(html?|htm|php)$/i.test(fileName);
    
    if (isPreviewableFile && baseUrl) {
      setSrcDoc('');
    } else {
      const previewContent = `<pre style="white-space:pre-wrap;font-family:monospace;padding:1rem;">${
        content.replace(/[&<>]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]!))
      }</pre>`;
      setSrcDoc(previewContent);
    }
  }, [content, fileName, error, baseUrl]);

  // Generate preview on demand from the current state
  const refreshPreview = () => {
    if (editMode === 'wysiwyg') {
      // If in WYSIWYG mode, update the preview from the WYSIWYG content
      const previewContent = wysiwygContent;
      setSrcDoc(previewContent);
    } else {
      // If in code mode, update the preview from the code content
      setSrcDoc(content);
    }
    // Force iframe refresh
    setRefreshKey(k => k + 1);
  };

  return (
    <ResizablePanelGroup 
      direction="vertical" 
      className="h-full rounded-lg border"
    >
      <ResizablePanel defaultSize={55} minSize={30}>
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between border-b p-1 bg-muted/30">
            <ToggleGroup 
              type="single" 
              value={editMode}
              onValueChange={handleToggleMode}
              className="ml-2"
            >
              <ToggleGroupItem 
                value="code" 
                aria-label="Toggle code editor"
                disabled={!isHtmlFile()}
                title={!isHtmlFile() ? "WYSIWYG only available for HTML files" : "Code editor"}
              >
                <Code className="h-4 w-4 mr-1" />
                Code
              </ToggleGroupItem>
              <ToggleGroupItem 
                value="wysiwyg" 
                aria-label="Toggle WYSIWYG editor"
                disabled={!isHtmlFile()}
                title={!isHtmlFile() ? "WYSIWYG only available for HTML files" : "Visual editor"}
              >
                <Bot className="h-4 w-4 mr-1" />
                WYSIWYG
              </ToggleGroupItem>
            </ToggleGroup>
            <div className="flex items-center">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={syncContent}
                className="mr-2"
                title="Sync content between editors"
              >
                <RefreshCw className="h-4 w-4 mr-1" /> Sync
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={refreshPreview}
                title="Refresh preview"
                className="mr-2"
              >
                Preview
              </Button>
            </div>
          </div>
          <div className="flex-grow relative">
            {editMode === 'code' ? (
              <CodeEditor
                content={content || ""}
                language={getFileLanguage()}
                onChange={debouncedChange}
                editorRef={editorRef}
              />
            ) : (
              <WysiwygEditor 
                content={wysiwygContent}
                onChange={setWysiwygContent}
                editorRef={wysiwygRef}
              />
            )}
          </div>
        </div>
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
            fileName && /\.(html?|htm|php)$/i.test(fileName) && baseUrl ? (
              <iframe
                key={fileName}
                data-key={refreshKey}
                src={`${baseUrl}${fileName.startsWith('/') ? '' : '/'}${fileName}`}
                className="w-full h-full pt-4 bg-white"
                title="Live Preview"
              />
            ) : (
              <iframe
                srcDoc={srcDoc}
                data-key={refreshKey}
                className="w-full h-full pt-4 bg-white"
                title="Preview"
                sandbox="allow-same-origin allow-scripts allow-forms"
              />
            )
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
