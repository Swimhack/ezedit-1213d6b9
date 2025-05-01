
import { useEffect, useState, useCallback } from "react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { CodeEditor } from "./CodeEditor";
import { WysiwygWrapper } from "./WysiwygWrapper";
import { Preview } from "./Preview";
import { toast } from "sonner";

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
  const [validatedContent, setValidatedContent] = useState<string | null>(null);
  
  // Validate content when it changes
  const validateContent = useCallback((content: string | undefined) => {
    if (content && typeof content === 'string' && content.trim().length > 0) {
      console.log(`[EditorPreviewSplit] Valid content received, length: ${content.length}`);
      console.log(`[EditorPreviewSplit] Content preview: ${content.slice(0, 100)}`);
      setIsContentValid(true);
      setValidatedContent(content);
      return true;
    } else {
      console.warn(`[EditorPreviewSplit] Invalid or empty content received:`, content);
      setIsContentValid(false);
      setValidatedContent(null);
      return false;
    }
  }, []);
  
  // Validate content when code prop changes
  useEffect(() => {
    validateContent(code);
  }, [code, validateContent]);
  
  // Force preview refresh when valid content changes or refresh is triggered
  useEffect(() => {
    if (isContentValid && editorContentReady && validatedContent) {
      setPreviewKey(prev => prev + 1);
    }
  }, [validatedContent, forceRefresh, editorContentReady, isContentValid]);
  
  const previewIframeId = `preview-iframe-${filePath?.replace(/[^a-zA-Z0-9]/g, '-')}`;
  
  // Show loading state if content is not valid or not ready
  if (!isContentValid || !editorContentReady || !validatedContent) {
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
              content={validatedContent}
              onChange={onCodeChange}
              language={detectLanguage()}
              readOnly={false}
            />
          ) : (
            <WysiwygWrapper
              code={validatedContent}
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
          content={validatedContent}
          iframeId={previewIframeId}
        />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
