
import { useEffect, useRef, useState } from "react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { EditorModeToggle } from "./EditorModeToggle";
import { EditorView } from "./EditorView";
import { PreviewPane } from "./PreviewPane";
import { Button } from "@/components/ui/button";
import { useFileExplorerStore } from "@/store/fileExplorerStore";
import { RefreshCw } from "lucide-react";
import debounce from "debounce";
import { HybridEditor } from "./HybridEditor";
import { Tabs, TabList, Tab } from "react-tabs";
import "react-tabs/style/react-tabs.css";

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
  const [frameKey, setFrameKey] = useState(0);
  const isLoading = useFileExplorerStore(state => state.isLoading);
  const activeConnection = useFileExplorerStore(state => state.activeConnection);
  const baseUrl = activeConnection?.web_url ?? '';
  const [editMode, setEditMode] = useState<'code' | 'wysiwyg' | 'hybrid'>('code');
  const [wysiwygContent, setWysiwygContent] = useState("");
  const [hybridContent, setHybridContent] = useState("");
  
  // Initialize content when loading new content
  useEffect(() => {
    console.log('[SplitEditor] Content updated, length:', content?.length || 0);
    if (content) {
      setWysiwygContent(content);
      setHybridContent(content);
    }
  }, [content, fileName]);

  const isHtmlFile = () => {
    return fileName ? /\.(html?|htm|php)$/i.test(fileName) : false;
  };

  // Set initial mode based on file type
  useEffect(() => {
    if (fileName) {
      const isHtml = isHtmlFile();
      console.log(`[SplitEditor] File type: ${fileName}, isHtml: ${isHtml}`);
      // Don't change the mode if already set, to respect user preference
      if (!document.activeElement || !document.activeElement.closest('.editor-container')) {
        setEditMode(isHtml ? 'hybrid' : 'code');
      }
    }
  }, [fileName]);

  // Enhanced sync function that also refreshes the preview
  const syncContent = () => {
    console.log(`[SplitEditor] Syncing content between editors, mode: ${editMode}`);
    if (editMode === 'wysiwyg') {
      onChange(wysiwygContent);
    } else if (editMode === 'hybrid') {
      onChange(hybridContent);
    } else {
      setWysiwygContent(content);
      setHybridContent(content);
    }
    setRefreshKey(k => k + 1);
    setFrameKey(k => k + 1); // Force iframe refresh
  };

  const handleContentChange = debounce((value: string | undefined) => {
    if (value !== undefined) {
      onChange(value);
      setRefreshKey(k => k + 1);
    }
  }, 500);

  const handleHybridContentChange = (value: string) => {
    setHybridContent(value);
    handleContentChange(value);
  };

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
      <ResizablePanel defaultSize={60} minSize={20}>
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between border-b p-1 bg-muted/30">
            <Tabs 
              selectedIndex={
                editMode === 'code' ? 0 : editMode === 'wysiwyg' ? 1 : 2
              }
              onSelect={(index) => setEditMode(
                index === 0 ? 'code' : index === 1 ? 'wysiwyg' : 'hybrid'
              )}
              className="flex-grow"
            >
              <TabList className="flex gap-2 mb-0">
                <Tab className="px-3 py-1.5 cursor-pointer rounded-md hover:bg-muted">
                  Code
                </Tab>
                {isHtmlFile() && (
                  <>
                    <Tab className="px-3 py-1.5 cursor-pointer rounded-md hover:bg-muted">
                      Rich Text
                    </Tab>
                    <Tab className="px-3 py-1.5 cursor-pointer rounded-md hover:bg-muted">
                      Visual Builder
                    </Tab>
                  </>
                )}
              </TabList>
            </Tabs>
            <Button 
              variant="outline" 
              size="sm"
              onClick={syncContent}
              className="mr-2 gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Sync Preview
            </Button>
          </div>
          <div className="flex-grow relative editor-container">
            {editMode === 'hybrid' ? (
              <HybridEditor
                content={content}
                fileName={fileName}
                onChange={handleHybridContentChange}
                editorRef={editorRef}
              />
            ) : (
              <EditorView
                mode={editMode}
                content={editMode === 'code' ? content : wysiwygContent}
                fileName={fileName}
                onChange={editMode === 'code' ? handleContentChange : setWysiwygContent}
                editorRef={editorRef}
                isLoading={isLoading}
              />
            )}
          </div>
        </div>
      </ResizablePanel>
      
      <ResizableHandle withHandle />
      
      <ResizablePanel defaultSize={40} minSize={20}>
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
            content={editMode === 'code' ? content : editMode === 'wysiwyg' ? wysiwygContent : hybridContent}
            baseUrl={baseUrl}
            error={error}
            refreshKey={frameKey}
          />
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
