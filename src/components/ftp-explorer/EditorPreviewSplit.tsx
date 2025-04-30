
import { useRef, useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import Split from "react-split";
import { Loader, RefreshCw } from "lucide-react";
import SplitHandle from "./SplitHandle";
import { useLivePreview } from "@/hooks/useLivePreview";
import { TinyMCEEditor } from "@/components/editor/TinyMCEEditor";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";

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
  const { isLight } = useTheme();
  const previewIframeId = "preview-iframe-" + Math.random().toString(36).substring(2, 9);
  const [editorLoading, setEditorLoading] = useState(true);
  const [contentReady, setContentReady] = useState(false);

  // Effect to track when content is ready to display
  useEffect(() => {
    console.log(`[EditorPreviewSplit] Code received, length: ${code?.length || 0}, filePath: ${filePath}`);
    
    if (code !== undefined) {
      setContentReady(true);
    } else {
      console.warn(`[EditorPreviewSplit] Code is undefined for file: ${filePath}`);
      setContentReady(false);
    }
  }, [code, filePath]);

  // Force refresh preview when forceRefresh prop changes
  useEffect(() => {
    if (forceRefresh > 0) {
      console.log('[EditorPreviewSplit] Force refreshing preview');
      setPreviewKey(prev => prev + 1);
    }
  }, [forceRefresh]);

  // Force refresh when code changes
  useEffect(() => {
    setPreviewKey(prev => prev + 1);
  }, [code]);

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

  console.log('[EditorPreviewSplit] Rendering with', editorMode, 'mode, filePath:', filePath, 'content ready:', contentReady);

  const renderEditor = () => {
    if (!contentReady) {
      return (
        <div className="flex items-center justify-center h-full">
          <Loader className="h-6 w-6 animate-spin text-gray-400" />
          <span className="ml-2">Waiting for content...</span>
        </div>
      );
    }
    
    if (editorMode === 'wysiwyg' && /\.(html?|htm|php)$/i.test(filePath)) {
      console.log('[EditorPreviewSplit] Rendering TinyMCE editor for', filePath);
      return (
        <div className="h-full">
          <TinyMCEEditor
            content={code}
            onChange={(newContent) => {
              console.log('[EditorPreviewSplit] TinyMCE content changed, length:', newContent.length);
              onCodeChange(newContent);
            }}
            height="100%"
            previewSelector={`#${previewIframeId}`}
            editorRef={editorRef}
          />
        </div>
      );
    }
    
    console.log('[EditorPreviewSplit] Rendering Monaco editor for', filePath);
    return (
      <Editor
        height="100%"
        language={detectLanguage()}
        theme={isLight ? "vs" : "vs-dark"}
        value={code}
        onChange={(newCode) => {
          console.log('[EditorPreviewSplit] Monaco content changed, length:', newCode?.length || 0);
          onCodeChange(newCode);
        }}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          wordWrap: "on",
          automaticLayout: true,
        }}
        loading={<div className="flex items-center justify-center h-full">
          <Loader className="h-6 w-6 animate-spin text-gray-400" />
        </div>}
      />
    );
  };

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
        {renderEditor()}
      </div>
      <div className="preview flex-1 min-h-0 overflow-auto bg-white">
        <div className="p-2 bg-gray-100 text-xs font-mono border-t border-b flex-none flex justify-between">
          <span>Preview</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleManualRefresh}
            className="p-0 h-4"
            title="Refresh preview"
          >
            <RefreshCw size={12} />
          </Button>
        </div>
        {!contentReady ? (
          <div className="flex items-center justify-center h-[calc(100%-28px)]">
            <Loader className="h-6 w-6 animate-spin text-gray-400" />
            <span className="ml-2">Loading file...</span>
          </div>
        ) : code === "" ? (
          <div className="flex items-center justify-center h-[calc(100%-28px)] text-gray-500">
            Empty file – nothing to preview
          </div>
        ) : previewLoading ? (
          <div className="flex items-center justify-center h-[calc(100%-28px)]">
            <Loader className="h-6 w-6 animate-spin text-gray-400" />
            <span className="ml-2">Generating preview...</span>
          </div>
        ) : (
          <iframe
            id={previewIframeId}
            key={previewKey}
            srcDoc={previewSrc}
            className="w-full h-[calc(100%-28px)] border-none"
            sandbox="allow-scripts"
            title="Preview"
          />
        )}
      </div>
    </Split>
  );
}
