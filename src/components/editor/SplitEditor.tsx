
import { useEffect, useRef, useState } from "react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { EditorModeToggle } from "./EditorModeToggle";
import { EditorView } from "./EditorView";
import { PreviewPane } from "./PreviewPane";
import { Button } from "@/components/ui/button";
import { useFileExplorerStore } from "@/store/fileExplorerStore";
import debounce from "debounce";

interface SplitEditorProps {
  fileName: string | null;
  content: string;
  onChange: (content: string) => void;
  editorRef?: React.MutableRefObject<any>;
  error?: string;
}

export function SplitEditor({ 
  fileName, 
  content, 
  onChange, 
  editorRef, 
  error 
}: SplitEditorProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const isLoading = useFileExplorerStore(state => state.isLoading);
  const activeConnection = useFileExplorerStore(state => state.activeConnection);
  const baseUrl = activeConnection?.web_url ?? '';
  const [editMode, setEditMode] = useState<'code' | 'wysiwyg'>('code');
  const [wysiwygContent, setWysiwygContent] = useState("");
  
  // Initialize WYSIWYG content when switching modes or when content changes
  useEffect(() => {
    if (isHtmlFile() && content) {
      setWysiwygContent(content);
    }
  }, [content, fileName]);

  const isHtmlFile = () => {
    return fileName ? /\.(html?|htm|php)$/i.test(fileName) : false;
  };

  // Sync content between editors
  const syncContent = () => {
    if (editMode === 'wysiwyg') {
      onChange(wysiwygContent);
    } else {
      setWysiwygContent(content);
    }
    setRefreshKey(k => k + 1);
  };

  const handleContentChange = debounce((value: string | undefined) => {
    if (value !== undefined) {
      onChange(value);
      setRefreshKey(k => k + 1);
    }
  }, 500);

  if (!fileName || !content && !isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        No file selected or content available
      </div>
    );
  }

  return (
    <ResizablePanelGroup 
      direction="vertical" 
      className="h-full rounded-lg border"
    >
      <ResizablePanel defaultSize={55} minSize={30}>
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between border-b p-1 bg-muted/30">
            <EditorModeToggle
              mode={editMode}
              onChange={setEditMode}
              isHtmlFile={isHtmlFile()}
            />
            <Button 
              variant="outline" 
              size="sm"
              onClick={syncContent}
              className="mr-2"
            >
              Sync & Preview
            </Button>
          </div>
          <div className="flex-grow relative">
            <EditorView
              mode={editMode}
              content={editMode === 'code' ? content : wysiwygContent}
              fileName={fileName}
              onChange={editMode === 'code' ? handleContentChange : setWysiwygContent}
              editorRef={editorRef}
              isLoading={isLoading}
            />
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
          <PreviewPane
            fileName={fileName}
            content={content}
            baseUrl={baseUrl}
            error={error}
            refreshKey={refreshKey}
          />
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
