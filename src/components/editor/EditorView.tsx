
import { useState, useEffect } from "react";
import { CodeEditor } from "./CodeEditor";
import { WysiwygEditor } from "./WysiwygEditor";
import { getLanguageFromFileName } from "@/utils/language-detector";

interface EditorViewProps {
  mode: 'code' | 'wysiwyg';
  content: string;
  fileName: string | null;
  onChange: (content: string) => void;
  editorRef?: React.MutableRefObject<any>;
  isLoading?: boolean;
  readOnly?: boolean;
}

export function EditorView({
  mode,
  content,
  fileName,
  onChange,
  editorRef,
  isLoading = false,
  readOnly = false
}: EditorViewProps) {
  const [contentLoaded, setContentLoaded] = useState(false);

  useEffect(() => {
    // Mark content as loaded when it arrives
    if (content && !contentLoaded) {
      console.log(`[EditorView] Content loaded, length: ${content.length}`);
      setContentLoaded(true);
    }
  }, [content, contentLoaded]);

  const getFileLanguage = () => {
    if (!fileName) return "plaintext";
    return getLanguageFromFileName(fileName) || "plaintext";
  };

  // Show loading state if content is not ready
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
        <span>Loading file content...</span>
      </div>
    );
  }

  // Show empty state if no content is available
  if (!content) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        No content to display
      </div>
    );
  }

  // Render the appropriate editor based on mode
  return mode === 'code' ? (
    <CodeEditor
      content={content}
      language={getFileLanguage()}
      onChange={onChange}
      editorRef={editorRef}
      readOnly={readOnly}
    />
  ) : (
    <WysiwygEditor 
      content={content}
      onChange={onChange}
      editorRef={editorRef}
      // Remove the readOnly prop as it's not supported by WysiwygEditor
    />
  );
}
