
import { useState } from "react";
import { SplitEditor } from "../editor/SplitEditor";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface FileEditorContentProps {
  filePath: string;
  content: string;
  showKlein: boolean;
  onContentChange: (content: string) => void;
  onApplyResponse: (response: string) => void;
  error?: string;
}

export function FileEditorContent({
  filePath,
  content,
  showKlein,
  onContentChange,
  error,
}: FileEditorContentProps) {
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(400);
  
  const handleResize = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.buttons === 1) {
      const startX = e.clientX;
      const startWidth = sidebarWidth;
      
      const handleMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = moveEvent.clientX - startX;
        const newWidth = Math.max(300, Math.min(600, startWidth - deltaX));
        setSidebarWidth(newWidth);
      };
      
      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
  };

  return (
    <div className="flex flex-1 h-full overflow-hidden">
      <div className={`flex-1 overflow-hidden ${showKlein ? 'md:w-1/2' : 'w-full'}`}>
        <SplitEditor
          fileName={filePath.split('/').pop() || null}
          content={content}
          onChange={onContentChange}
          error={error}
        />
      </div>
      
      {showKlein && sidebarVisible && (
        <>
          <div 
            className="hidden md:block w-1 bg-ezgray-dark cursor-col-resize" 
            onMouseDown={handleResize}
          />
          <div 
            className="md:flex-shrink-0 klein-pane-transition overflow-hidden"
            style={{ width: showKlein ? sidebarWidth : 0 }}
          />
        </>
      )}
      
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-4 md:right-6 md:top-6 z-10 bg-eznavy-light/80 hover:bg-eznavy"
        onClick={() => setSidebarVisible(!sidebarVisible)}
      >
        {sidebarVisible ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </Button>
    </div>
  );
}
