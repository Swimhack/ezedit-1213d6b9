
import React, { useEffect } from "react";
import Editor from "@monaco-editor/react";
import { Loader } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

interface CodeEditorPaneProps {
  code: string;
  contentReady: boolean;
  language: string;
  onCodeChange: (newCode: string | undefined) => void;
  editorRef: React.MutableRefObject<any>;
  onEditorDidMount: (editor: any) => void;
}

export function CodeEditorPane({
  code,
  contentReady,
  language,
  onCodeChange,
  editorRef,
  onEditorDidMount,
}: CodeEditorPaneProps) {
  const { isLight } = useTheme();

  // Force Monaco to update layout after mount
  useEffect(() => {
    if (editorRef.current) {
      const timer = setTimeout(() => {
        try {
          editorRef.current.layout();
          console.log('[CodeEditorPane] Resized Monaco editor');
        } catch (err) {
          console.error('[CodeEditorPane] Error resizing editor:', err);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [editorRef]);

  if (!contentReady) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="h-6 w-6 animate-spin text-gray-400" />
        <span className="ml-2">Waiting for content...</span>
      </div>
    );
  }

  return (
    <Editor
      height="100%"
      language={language}
      theme={isLight ? "vs" : "vs-dark"}
      value={code}
      onChange={onCodeChange}
      onMount={onEditorDidMount}
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
}
