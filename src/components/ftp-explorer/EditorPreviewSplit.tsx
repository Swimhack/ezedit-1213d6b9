
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

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    editor.focus();
  };

  const handleSplitDragStart = () => {
    setDraggingSplitter(true);
  };

  const handleSplitDragEnd = () => {
    setDraggingSplitter(false);
    
    // Manually trigger a resize event to ensure Monaco Editor adjusts properly
    if (editorRef.current && editorMode === 'code') {
      setTimeout(() => {
        editorRef.current.layout();
      }, 100);
    }
  };

  const renderEditor = () => {
    if (editorMode === 'wysiwyg' && /\.(html?|htm|php)$/i.test(filePath)) {
      return (
        <TinyMCEEditor
          content={code}
          onChange={(newContent) => onCodeChange(newContent)}
          height="100%"
          previewSelector=".preview iframe"
          editorRef={editorRef}
        />
      );
    }
    
    return (
      <Editor
        height="100%"
        language={detectLanguage()}
        theme={isLight ? "vs" : "vs-dark"}
        value={code}
        onChange={onCodeChange}
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
          srcDoc={previewSrc}
          className="w-full h-[calc(100%-28px)] border-none"
          sandbox="allow-scripts"
          title="Preview"
        />
      </div>
    </Split>
  );
}
