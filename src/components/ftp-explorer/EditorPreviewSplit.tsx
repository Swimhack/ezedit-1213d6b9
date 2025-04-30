
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
  const [contentReady, setContentReady] = useState(false);
  const [editorContent, setEditorContent] = useState<string>(code || '');

  // Effect to track when content is ready to display and update internal state
  useEffect(() => {
    console.log(`[EditorPreviewSplit] Code received, length: ${code?.length || 0}, filePath: ${filePath}`);
    
    if (code !== undefined) {
      setContentReady(true);
      setEditorContent(code);
      
      // Force content update to editor if it's already mounted
      if (editorRef.current) {
        try {
          if (editorMode === 'wysiwyg' && typeof editorRef.current.setContent === 'function') {
            console.log('[EditorPreviewSplit] Forcing WYSIWYG content update after code change');
            editorRef.current.setContent(code);
          }
        } catch (err) {
          console.error('[EditorPreviewSplit] Error updating editor content:', err);
        }
      }
    } else {
      console.warn(`[EditorPreviewSplit] Code is undefined for file: ${filePath}`);
      setContentReady(false);
    }
    
    // Refresh preview when code changes
    setPreviewKey(prev => prev + 1);
  }, [code, filePath, editorMode]);

  // Force refresh preview when forceRefresh prop changes
  useEffect(() => {
    if (forceRefresh > 0) {
      console.log('[EditorPreviewSplit] Force refreshing preview');
      setPreviewKey(prev => prev + 1);
    }
  }, [forceRefresh]);

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
    setPreviewKey(prev => prev + 1);
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
        {showWysiwyg ? (
          <WysiwygWrapper
            code={code}
            filePath={filePath}
            onCodeChange={handleEditorContentChange}
            editorRef={editorRef}
            previewIframeId={previewIframeId}
          />
        ) : (
          <CodeEditorPane
            code={code}
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
          code={editorContent} // Use the internal editor content for preview
        />
      </div>
    </Split>
  );
}
