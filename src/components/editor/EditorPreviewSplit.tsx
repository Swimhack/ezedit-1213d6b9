
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
  editorContentReady?: boolean;
}

export function EditorPreviewSplit({
  code,
  filePath,
  onCodeChange,
  detectLanguage,
  editorMode,
  forceRefresh = 0,
  editorContentReady = true
}: EditorPreviewSplitProps) {
  const [previewKey, setPreviewKey] = useState(0);
  const [isContentValid, setIsContentValid] = useState(false);
  
  // Validate content when it changes
  useEffect(() => {
    if (code && typeof code === 'string' && code.trim().length > 0) {
      console.log(`[EditorPreviewSplit] Valid content received, length: ${code.length}`);
      setIsContentValid(true);
    } else {
      console.warn(`[EditorPreviewSplit] Invalid or empty content received`);
      setIsContentValid(false);
    }
  }, [code]);
  
  // Force preview refresh when code changes or refresh is triggered
  useEffect(() => {
    if (isContentValid && editorContentReady) {
      setPreviewKey(prev => prev + 1);
    }
  }, [code, forceRefresh, editorContentReady, isContentValid]);
  
  const previewIframeId = `preview-iframe-${filePath?.replace(/[^a-zA-Z0-9]/g, '-')}`;
  
  // Show loading state if content is not valid or not ready
  if (!isContentValid || !editorContentReady) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="h-6 w-6 animate-spin mb-2 rounded-full border-2 border-b-transparent border-primary"></div>
          <span>Waiting for valid file content...</span>
        </div>
      </div>
    );
  }
  
  return (
    <ResizablePanelGroup direction="horizontal" className="h-full">
      <ResizablePanel defaultSize={50} minSize={30}>
        <div className="h-full">
          {editorMode === 'code' ? (
            <CodeEditor
              content={code}
              onChange={onCodeChange}
              language={detectLanguage()}
              readOnly={false}
            />
          ) : (
            <WysiwygWrapper
              code={code}
              filePath={filePath}
              onCodeChange={onCodeChange}
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
