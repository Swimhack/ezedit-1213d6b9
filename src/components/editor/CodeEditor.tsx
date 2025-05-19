
import React, { useEffect } from 'react';
import Editor from "@monaco-editor/react";

interface CodeEditorProps {
  content: string;
  language: string;
  onChange: (value: string | undefined) => void;
  editorRef?: React.MutableRefObject<any>;
  readOnly?: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ 
  content, 
  language, 
  onChange, 
  editorRef,
  readOnly = false
}) => {
  // Force editor refresh when content changes
  useEffect(() => {
    if (editorRef?.current?.layout) {
      const timer = setTimeout(() => {
        editorRef.current.layout();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [content, editorRef]);

  // Additional useEffect to handle window resize events
  useEffect(() => {
    const handleResize = () => {
      if (editorRef?.current?.layout) {
        editorRef.current.layout();
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [editorRef]);

  const handleEditorDidMount = (editor: any) => {
    if (editorRef) {
      editorRef.current = editor;
      setTimeout(() => editor.layout(), 100);
    }
  };

  return (
    <div className="h-full w-full">
      <Editor
        height="100%"
        language={language}
        value={content}
        onChange={onChange}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          wordWrap: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          fixedOverflowWidgets: true,
          readOnly: readOnly,
        }}
        onMount={handleEditorDidMount}
      />
    </div>
  );
};
