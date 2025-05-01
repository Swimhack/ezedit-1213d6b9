
import { useEffect, useState } from "react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { CodeEditor } from "./CodeEditor";
import { WysiwygWrapper } from "./WysiwygWrapper";
import { Preview } from "./Preview";

interface EditorPreviewSplitProps {
  code: string;
  filePath: string;
  onCodeChange: (newCode: string) => void;
  detectLanguage: () => string;
  editorMode: 'code' | 'wysiwyg';
  forceRefresh?: number;
  editorRef?: React.MutableRefObject<any>;
  editorContentReady?: boolean;
}

export function EditorPreviewSplit({
  code,
  filePath,
  onCodeChange,
  detectLanguage,
  editorMode,
  forceRefresh = 0,
  editorRef,
  editorContentReady = true
}: EditorPreviewSplitProps) {
  const [previewKey, setPreviewKey] = useState(0);
  
  // Force preview refresh when code changes or refresh is triggered
  useEffect(() => {
    if (code && editorContentReady) {
      setPreviewKey(prev => prev + 1);
    }
  }, [code, forceRefresh, editorContentReady]);
  
  const previewIframeId = `preview-iframe-${filePath?.replace(/[^a-zA-Z0-9]/g, '-')}`;
  
  return (
    <ResizablePanelGroup direction="horizontal" className="h-full">
      <ResizablePanel defaultSize={50} minSize={30}>
        <div className="h-full">
          {editorMode === 'code' ? (
            <CodeEditor
              code={code}
              onChange={onCodeChange}
              language={detectLanguage()}
              readOnly={false}
            />
          ) : (
            <WysiwygWrapper
              code={code}
              filePath={filePath}
              onCodeChange={onCodeChange}
              editorRef={editorRef}
              previewIframeId={previewIframeId}
            />
          )}
        </div>
      </ResizablePanel>
      
      <ResizableHandle withHandle />
      
      <ResizablePanel defaultSize={50} minSize={30}>
        <Preview
          key={previewKey}
          content={code}
          iframeId={previewIframeId}
        />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
