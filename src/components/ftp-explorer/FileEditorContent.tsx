
import { CodeEditor } from "../editor/CodeEditor";
import { getLanguageFromFileName } from "@/utils/language-detector";
import ClinePane from "../ClinePane";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRef, useEffect } from "react";

interface FileEditorContentProps {
  filePath: string;
  content: string;
  showKlein: boolean;
  onContentChange: (content: string) => void;
  onApplyResponse: (text: string) => void;
}

export const FileEditorContent = ({
  filePath,
  content,
  showKlein,
  onContentChange,
  onApplyResponse
}: FileEditorContentProps) => {
  const isMobile = useIsMobile();
  const editorRef = useRef<any>(null);
  
  useEffect(() => {
    // Force layout when component mounts or content changes
    if (editorRef.current?.layout) {
      const timer = setTimeout(() => {
        editorRef.current.layout();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [content]);
  
  const getFileLanguage = () => {
    if (!filePath) return "plaintext";
    return getLanguageFromFileName(filePath) || "plaintext";
  };

  if (!filePath) {
    return (
      <div className="flex items-center justify-center h-64 text-ezgray border border-dashed border-ezgray-dark rounded-md mx-4">
        Select a file to view its contents
      </div>
    );
  }

  return (
    <div className="flex-1 px-4 pb-4">
      <ResizablePanelGroup direction={isMobile ? "vertical" : "horizontal"}>
        <ResizablePanel defaultSize={70} minSize={40}>
          <div className="h-[calc(100vh-280px)] border border-ezgray-dark rounded">
            <CodeEditor
              content={content}
              language={getFileLanguage()}
              onChange={onContentChange}
              editorRef={editorRef}
            />
          </div>
        </ResizablePanel>
        {showKlein && (
          <>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={30} minSize={20}>
              <div className="h-full">
                <div className="p-3 border-b border-ezgray-dark">
                  <h3 className="text-sm font-medium text-ezwhite">AI Assistant</h3>
                </div>
                <ClinePane 
                  filePath={filePath}
                  fileContent={content}
                  onApplyResponse={onApplyResponse}
                />
              </div>
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  );
}
