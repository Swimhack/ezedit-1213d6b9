
import { useState, useRef, useEffect } from "react";
import { SplitEditor } from "../editor/SplitEditor";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight, Loader } from "lucide-react";

interface FileEditorContentProps {
  filePath: string;
  content: string;
  showKlein: boolean;
  onContentChange: (content: string) => void;
  onApplyResponse: (response: string) => void;
  error?: string;
  isLoading?: boolean;
}

export function FileEditorContent({
  filePath,
  content,
  showKlein,
  onContentChange,
  error,
  isLoading = false,
}: FileEditorContentProps) {
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(400);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.srcdoc = content;
    }
  }, [content]);

  const handleResize = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.buttons !== 1) return;
    const startX = e.clientX;
    const startWidth = sidebarWidth;
    const onMove = (m: MouseEvent) => {
      const delta = m.clientX - startX;
      setSidebarWidth(Math.max(300, Math.min(600, startWidth - delta)));
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  return (
    <div className="flex flex-1 h-full overflow-hidden relative">
      <div className={`flex-1 h-full overflow-hidden ${showKlein ? "md:w-1/2" : "w-full"}`}>
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader className="w-8 h-8 animate-spin text-ezblue mr-2" />
            <span className="text-ezwhite">Loading file…</span>
          </div>
        ) : (
          <SplitEditor
            fileName={filePath.split("/").pop() || undefined}
            content={content}
            onChange={(newContent) => {
              onContentChange(newContent);
              if (iframeRef.current) {
                iframeRef.current.srcdoc = newContent;
              }
            }}
            error={error}
            editorRef={null}
          />
        )}
      </div>

      {showKlein && sidebarVisible && (
        <>
          <div
            className="hidden md:block w-1 bg-ezgray-dark cursor-col-resize"
            onMouseDown={handleResize}
          />
          <div
            className="md:flex-shrink-0 overflow-hidden transition-width"
            style={{ width: sidebarWidth }}
          >
            <iframe
              ref={iframeRef}
              className="w-full h-full border-0"
              title="Live Preview"
            />
          </div>
        </>
      )}

      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-4 z-10 bg-eznavy-light/80 hover:bg-eznavy"
        onClick={() => setSidebarVisible(!sidebarVisible)}
      >
        {sidebarVisible ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </Button>
    </div>
  );
}