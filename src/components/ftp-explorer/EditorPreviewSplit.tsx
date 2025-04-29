
import { useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import Split from "react-split";
import { Loader } from "lucide-react";
import SplitHandle from "./SplitHandle";
import { useLivePreview } from "@/hooks/useLivePreview";

interface EditorPreviewSplitProps {
  code: string;
  filePath: string;
  onCodeChange: (newCode: string | undefined) => void;
  detectLanguage: () => string;
}

export function EditorPreviewSplit({
  code,
  filePath,
  onCodeChange,
  detectLanguage
}: EditorPreviewSplitProps) {
  const [draggingSplitter, setDraggingSplitter] = useState(false);
  const editorRef = useRef<any>(null);
  const previewSrc = useLivePreview(code, filePath || "");

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
    if (editorRef.current) {
      setTimeout(() => {
        editorRef.current.layout();
      }, 100);
    }
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
        <Editor
          height="100%"
          language={detectLanguage()}
          theme="vs-dark"
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
      </div>
      <div className="preview flex-1 min-h-0 overflow-auto bg-white dark:bg-gray-900">
        <div className="p-2 bg-gray-100 dark:bg-gray-800 text-xs font-mono border-t border-b dark:border-gray-700 flex-none">
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
