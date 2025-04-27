
import { useState } from "react";
import { CodeEditor } from "./CodeEditor";
import { WysiwygEditor } from "./WysiwygEditor";
import { getLanguageFromFileName } from "@/utils/language-detector";

interface EditorViewProps {
  mode: 'code' | 'wysiwyg';
  content: string;
  fileName: string | null;
  onChange: (content: string) => void;
  editorRef?: React.MutableRefObject<any>;
}

export function EditorView({
  mode,
  content,
  fileName,
  onChange,
  editorRef
}: EditorViewProps) {
  const getFileLanguage = () => {
    if (!fileName) return "plaintext";
    return getLanguageFromFileName(fileName) || "plaintext";
  };

  // Show loading state if content is not ready
  if (!content) {
    return <div className="flex items-center justify-center h-full text-slate-400">Loading editor content...</div>;
  }

  return mode === 'code' ? (
    <CodeEditor
      content={content}
      language={getFileLanguage()}
      onChange={onChange}
      editorRef={editorRef}
    />
  ) : (
    <WysiwygEditor 
      content={content}
      onChange={onChange}
      editorRef={editorRef}
    />
  );
}
