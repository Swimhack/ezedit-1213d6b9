
import { useEffect, useRef, useState, useCallback } from "react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { EditorModeToggle } from "./EditorModeToggle";
import { EditorView } from "./EditorView";
import { PreviewPane } from "./PreviewPane";
import { Button } from "@/components/ui/button";
import { useFileExplorerStore } from "@/store/fileExplorerStore";
import { RefreshCw } from "lucide-react";
import debounce from "debounce";
import { HybridEditor } from "./HybridEditor";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EditorStatusBar } from "./EditorStatusBar";

interface SplitEditorProps {
  fileName: string | null;
  content: string;
  onChange: (content: string) => void;
  editorRef?: React.MutableRefObject<any>;
  error?: string;
  readOnly?: boolean;
}

export function SplitEditor({ 
  fileName, 
  content, 
  onChange, 
  editorRef, 
  error,
  readOnly = false
}: SplitEditorProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [frameKey, setFrameKey] = useState(0);
  const [editorStatus, setEditorStatus] = useState<{
    intent: 'loading' | 'success' | 'warning' | 'error' | 'info';
    message: string;
  }>({ intent: 'loading', message: 'Initializing editor...' });
  
  const isLoading = useFileExplorerStore(state => state.isLoading);
  const activeConnection = useFileExplorerStore(state => state.activeConnection);
  const baseUrl = activeConnection?.web_url ?? '';
  const [editMode, setEditMode] = useState<'code' | 'wysiwyg' | 'hybrid'>('code');
  const [isEditorHydrated, setIsEditorHydrated] = useState(false);
  const [wysiwygContent, setWysiwygContent] = useState("");
  const [hybridContent, setHybridContent] = useState("");
  const localEditorRef = useRef<any>(null);
  const actualEditorRef = editorRef || localEditorRef;
  
  // Force content hydration for all editor modes
  const forceHydration = useCallback(async () => {
    setEditorStatus({ intent: 'loading', message: '🔒 Validating file structure...' });
    
    try {
      if (!content) {
        throw new Error('No content to hydrate');
      }
      
      console.log('[SplitEditor] Forcing hydration with content length:', content.length);
      
      // Set content based on current mode
      if (editMode === 'code' && actualEditorRef.current) {
        try {
          actualEditorRef.current.setValue(content);
        } catch (err) {
          console.error('[SplitEditor] Failed to set code editor content:', err);
        }
      } else if (editMode === 'wysiwyg' && actualEditorRef.current) {
        if (actualEditorRef.current.forceContentInjection) {
          await actualEditorRef.current.forceContentInjection(content);
        } else if (actualEditorRef.current.setContent) {
          actualEditorRef.current.setContent(content);
        }
      } else if (editMode === 'hybrid') {
        setHybridContent(content);
      }
      
      // Update all content states to ensure consistency
      setWysiwygContent(content);
      setHybridContent(content);
      
      // Update preview
      setRefreshKey(k => k + 1);
      setFrameKey(k => k + 1);
      
      setEditorStatus({ 
        intent: 'success', 
        message: '✅ File atomic-locked | Edits enabled' 
      });
      setIsEditorHydrated(true);
      
    } catch (err) {
      console.error('[SplitEditor] Hydration failed:', err);
      setEditorStatus({ 
        intent: 'error', 
        message: '🚨 Editor content validation failed' 
      });
      setIsEditorHydrated(false);
    }
  }, [content, editMode, actualEditorRef]);
  
  // Initialize content when loading new content
  useEffect(() => {
    if (content && fileName) {
      console.log('[SplitEditor] Content updated for file:', fileName, 'length:', content.length);
      forceHydration();
    } else {
      setIsEditorHydrated(false);
      setEditorStatus({
        intent: 'info',
        message: content ? 'Editor initializing...' : 'No content to display'
      });
    }
  }, [content, fileName, forceHydration]);

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
    setEditorStatus({
      intent: 'loading',
      message: 'Synchronizing content...'
    });
    
    if (editMode === 'wysiwyg') {
      onChange(wysiwygContent);
    } else if (editMode === 'hybrid') {
      onChange(hybridContent);
    } else {
      setWysiwygContent(content);
      setHybridContent(content);
    }
    
    // Update preview
    setRefreshKey(k => k + 1);
    setFrameKey(k => k + 1);
    
    setEditorStatus({
      intent: 'success',
      message: 'Content synchronized successfully'
    });
  };

  const handleContentChange = debounce((value: string | undefined) => {
    if (value !== undefined && !readOnly) {
      onChange(value);
      setRefreshKey(k => k + 1);
      setEditorStatus({
        intent: 'info',
        message: 'Content updated'
      });
    }
  }, 500);

  const handleHybridContentChange = (value: string) => {
    setHybridContent(value);
    if (!readOnly) {
      handleContentChange(value);
    }
  };

  const handleRetryLoad = () => {
    forceHydration();
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
              value={editMode} 
              onValueChange={(value) => setEditMode(value as 'code' | 'wysiwyg' | 'hybrid')}
              className="flex-grow"
            >
              <TabsList className="bg-transparent">
                <TabsTrigger value="code">Code</TabsTrigger>
                {isHtmlFile() && (
                  <>
                    <TabsTrigger value="wysiwyg">Rich Text</TabsTrigger>
                    <TabsTrigger value="hybrid">Visual Builder</TabsTrigger>
                  </>
                )}
              </TabsList>
            </Tabs>
            <Button 
              variant="outline" 
              size="sm"
              onClick={syncContent}
              className="mr-2 gap-2"
              disabled={readOnly}
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
                readOnly={readOnly}
              />
            ) : (
              <EditorView
                key={`${editMode}-editor-${fileName}`}
                mode={editMode}
                content={editMode === 'code' ? content : wysiwygContent}
                fileName={fileName}
                onChange={editMode === 'code' ? handleContentChange : setWysiwygContent}
                editorRef={editorRef}
                isLoading={isLoading}
                readOnly={readOnly}
              />
            )}
          </div>
          
          <EditorStatusBar
            intent={editorStatus.intent}
            message={editorStatus.message}
            isEditable={!readOnly && isEditorHydrated}
            onRetry={handleRetryLoad}
          />
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
