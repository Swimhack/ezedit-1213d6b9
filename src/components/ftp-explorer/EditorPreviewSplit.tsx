
import { useRef, useState, useEffect } from "react";
import Split from "react-split";
import SplitHandle from "./SplitHandle";
import { useLivePreview } from "@/hooks/useLivePreview";
import { CodeEditorPane } from "@/components/editor/CodeEditorPane";
import { PreviewFrame } from "@/components/editor/PreviewFrame";
import { PreviewToolbar } from "@/components/editor/PreviewToolbar";
import { WysiwygWrapper } from "@/components/editor/WysiwygWrapper";

interface EditorPreviewSplitProps {
  code: string;
  filePath: string;
  onCodeChange: (newCode: string | undefined) => void;
  detectLanguage: () => string;
  editorMode?: 'code' | 'wysiwyg';
  forceRefresh?: number;
}

export function EditorPreviewSplit({
  code,
  filePath,
  onCodeChange,
  detectLanguage,
  editorMode = 'code',
  forceRefresh = 0
}: EditorPreviewSplitProps) {
  const [draggingSplitter, setDraggingSplitter] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const editorRef = useRef<any>(null);
  const { src: previewSrc, isLoading: previewLoading } = useLivePreview(code, filePath || "");
  const previewIframeId = "preview-iframe-" + Math.random().toString(36).substring(2, 9);
  const [editorLoading, setEditorLoading] = useState(true);
  const [editorContent, setEditorContent] = useState<string>('');
  const [contentReady, setContentReady] = useState(false);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [lastFilePath, setLastFilePath] = useState<string>('');
  const [lastForceRefresh, setLastForceRefresh] = useState<number>(0);

  // Effect to load file content when path changes or force refresh happens
  useEffect(() => {
    const pathChanged = filePath && filePath !== lastFilePath;
    const refreshTriggered = forceRefresh > 0 && forceRefresh !== lastForceRefresh;
    
    if (pathChanged || refreshTriggered) {
      if (pathChanged) {
        console.log(`[EditorPreviewSplit] File path changed: ${filePath}`);
        setLastFilePath(filePath);
      }
      
      if (refreshTriggered) {
        console.log('[EditorPreviewSplit] Force refreshing content');
        setLastForceRefresh(forceRefresh);
      }
      
      loadFileContent(filePath);
    }
  }, [filePath, forceRefresh]);

  // Effect to track when code prop changes
  useEffect(() => {
    if (typeof code === 'string') {
      console.log(`[EditorPreviewSplit] Code received, length: ${code?.length || 0}, filePath: ${filePath}`);
      setEditorContent(code);
      setContentReady(true);
      setIsEditorReady(true);
      
      // Refresh preview when code changes
      setPreviewKey(prev => prev + 1);
    } else {
      console.warn(`[EditorPreviewSplit] Code is undefined or not a string for file: ${filePath}`);
      setContentReady(false);
    }
  }, [code, filePath]);

  // Implement file loading with cache busting
  const loadFileContent = async (path: string) => {
    if (!path) return;
    
    setEditorLoading(true);
    setIsEditorReady(false);
    setContentReady(false);
    
    try {
      console.log(`[EditorPreviewSplit] Loading file content: ${path}`);
      const res = await fetch(`/api/readFile?path=${encodeURIComponent(path)}&t=${Date.now()}`, {
        method: "GET",
        cache: "no-store",
        headers: {
          "Pragma": "no-cache",
          "Cache-Control": "no-cache"
        }
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}: ${res.statusText}`);
      }
      
      const content = await res.text();
      console.log(`[EditorPreviewSplit] File content loaded, length: ${content.length}`);
      
      setEditorContent(content);
      setContentReady(true);
      setIsEditorReady(true);
      onCodeChange(content);
      
      // Force preview update
      setPreviewKey(prev => prev + 1);
    } catch (err) {
      console.error(`[EditorPreviewSplit] Error loading file: ${path}`, err);
    } finally {
      setEditorLoading(false);
    }
  };

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    editor.focus();
    setEditorLoading(false);
    
    // Set content explicitly after mount if we have code
    if (code) {
      try {
        editor.setValue(code);
        console.log('[EditorPreviewSplit] Content set in Monaco editor after mount');
      } catch (err) {
        console.error('[EditorPreviewSplit] Error setting Monaco editor content:', err);
      }
    }
    
    console.log('[EditorPreviewSplit] Monaco editor mounted');
  };

  const handleEditorContentChange = (newContent: string | undefined) => {
    if (newContent !== undefined) {
      console.log('[EditorPreviewSplit] Editor content changed, length:', newContent.length);
      setEditorContent(newContent);
      onCodeChange(newContent);
    }
  };

  const handleSplitDragStart = () => {
    setDraggingSplitter(true);
  };

  const handleSplitDragEnd = () => {
    setDraggingSplitter(false);
    
    // Manually trigger a resize event to ensure Monaco Editor adjusts properly
    if (editorRef.current && editorMode === 'code') {
      setTimeout(() => {
        console.log('[EditorPreviewSplit] Triggering editor layout after split resize');
        editorRef.current.layout();
      }, 100);
    }
  };

  const handleManualRefresh = () => {
    console.log('[EditorPreviewSplit] Manual refresh triggered');
    loadFileContent(filePath);
  };

  // Determine if we should show WYSIWYG editor
  const isHtmlFile = /\.(html?|htm|php)$/i.test(filePath);
  const showWysiwyg = editorMode === 'wysiwyg' && isHtmlFile;

  return (
    <Split
      direction="vertical"
      sizes={[60, 40]}
      minSize={100}
      gutterSize={8}
      onDragStart={handleSplitDragStart}
      onDragEnd={handleSplitDragEnd}
      gutter={index => {
        const gutter = document.createElement('div');
        const handle = <SplitHandle 
          direction="vertical" 
          dragging={draggingSplitter}
        />;
        return gutter;
      }}
      className="h-full"
    >
      <div className="editor-pane overflow-hidden">
        {editorLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="h-6 w-6 animate-spin mr-2 rounded-full border-2 border-b-transparent border-primary"></div>
            <span>Loading editor...</span>
          </div>
        ) : !isEditorReady || !contentReady ? (
          <div className="flex items-center justify-center h-full">
            <div className="h-6 w-6 animate-spin mr-2 rounded-full border-2 border-b-transparent border-primary"></div>
            <span>Preparing editor content...</span>
          </div>
        ) : showWysiwyg ? (
          <WysiwygWrapper
            code={editorContent}
            filePath={filePath}
            onCodeChange={handleEditorContentChange}
            editorRef={editorRef}
            previewIframeId={previewIframeId}
          />
        ) : (
          <CodeEditorPane
            code={editorContent}
            contentReady={contentReady}
            language={detectLanguage()}
            onCodeChange={handleEditorContentChange}
            editorRef={editorRef}
            onEditorDidMount={handleEditorDidMount}
          />
        )}
      </div>
      <div className="preview flex-1 min-h-0 overflow-auto bg-white">
        <PreviewToolbar onManualRefresh={handleManualRefresh} />
        <PreviewFrame
          previewSrc={previewSrc}
          previewKey={previewKey}
          previewIframeId={previewIframeId}
          contentReady={contentReady}
          isLoading={previewLoading}
          code={editorContent}
        />
      </div>
    </Split>
  );
}
