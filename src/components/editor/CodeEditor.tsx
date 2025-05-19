
import React, { useEffect } from "react";
import Editor from "@monaco-editor/react";
import { Loader } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

interface CodeEditorProps {
  content: string;
  language: string;
  onChange: (newContent: string | undefined) => void;
  editorRef?: React.MutableRefObject<any>;
  readOnly?: boolean;
}

export function CodeEditor({
  content,
  language,
  onChange,
  editorRef,
  readOnly = false
}: CodeEditorProps) {
  const { isLight } = useTheme();

  // Determine proper language mode based on file extension
  const detectLanguage = (lang: string) => {
    switch (lang.toLowerCase()) {
      case 'js':
      case 'jsx':
        return 'javascript';
      case 'ts':
      case 'tsx':
        return 'typescript';
      case 'html':
      case 'htm':
        return 'html';
      case 'css':
        return 'css';
      case 'json':
        return 'json';
      case 'md':
        return 'markdown';
      case 'php':
        return 'php';
      case 'py':
        return 'python';
      case 'java':
        return 'java';
      case 'c':
        return 'c';
      case 'cpp':
      case 'cc':
        return 'cpp';
      default:
        return language || 'plaintext';
    }
  };

  const handleEditorDidMount = (editor: any, monaco: any) => {
    if (editorRef) {
      editorRef.current = editor;
    }

    // Force layout after mounting
    setTimeout(() => {
      try {
        editor.layout();
      } catch (err) {
        console.error('Error initializing editor layout:', err);
      }
    }, 100);
  };

  return (
    <Editor
      height="100%"
      language={detectLanguage(language)}
      theme={isLight ? "vs" : "vs-dark"}
      value={content}
      onChange={onChange}
      onMount={handleEditorDidMount}
      options={{
        readOnly,
        minimap: { enabled: false },
        fontSize: 14,
        wordWrap: "on",
        automaticLayout: true,
        formatOnPaste: true,
        formatOnType: true,
        scrollBeyondLastLine: false,
        tabSize: 2,
        rulers: [80, 120],
        renderLineHighlight: "all",
        bracketPairColorization: { enabled: true },
      }}
      loading={
        <div className="flex items-center justify-center h-full">
          <Loader className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      }
    />
  );
}
