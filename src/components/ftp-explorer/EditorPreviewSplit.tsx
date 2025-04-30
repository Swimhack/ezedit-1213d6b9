
import { useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import Split from "react-split";
import { Loader } from "lucide-react";
import SplitHandle from "./SplitHandle";
import { useLivePreview } from "@/hooks/useLivePreview";
import { TinyMCEEditor } from "@/components/editor/TinyMCEEditor";
import { useTheme } from "@/hooks/use-theme";

interface EditorPreviewSplitProps {
  code: string;
  filePath: string;
  onCodeChange: (newCode: string | undefined) => void;
  detectLanguage: () => string;
  editorMode?: 'code' | 'wysiwyg';
}

export function EditorPreviewSplit({
  code,
  filePath,
  onCodeChange,
  detectLanguage,
  editorMode = 'code'
}: EditorPreviewSplitProps) {
  const [draggingSplitter, setDraggingSplitter] = useState(false);
  const editorRef = useRef<any>(null);
  const previewSrc = useLivePreview(code, filePath || "");
  const { isLight } = useTheme();
  const previewIframeId = "preview-iframe-" + Math.random().toString(36).substring(2, 9);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    editor.focus();
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

  console.log('[EditorPreviewSplit] Rendering with', editorMode, 'mode, filePath:', filePath);

  const renderEditor = () => {
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
        <div className="p-2 bg-gray-100 text-xs font-mono border-t border-b flex-none">
          Preview
        </div>
        <iframe
          id={previewIframeId}
          srcDoc={previewSrc}
          className="w-full h-[calc(100%-28px)] border-none"
          sandbox="allow-scripts"
          title="Preview"
        />
      </div>
    </Split>
  );
}
