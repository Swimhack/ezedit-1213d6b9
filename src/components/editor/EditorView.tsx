
import { useState, useEffect } from "react";
import { CodeEditor } from "./CodeEditor";
import { WysiwygEditor } from "./WysiwygEditor";
import { getLanguageFromFileName } from "@/utils/language-detector";
import { Loader } from "lucide-react";

interface EditorViewProps {
  mode: 'code' | 'wysiwyg';
  content: string | null;
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
  const [editorKey, setEditorKey] = useState(`editor-${Date.now()}`);

  useEffect(() => {
    // Mark content as loaded when it arrives and is valid
    if (content && !contentLoaded) {
      console.log(`[EditorView] Content loaded, length: ${content.length}`);
      setContentLoaded(true);
      
      // Force editor remount when content or file changes
      setEditorKey(`editor-${fileName}-${content.slice(0, 20)}-${Date.now()}`);
    }
  }, [content, contentLoaded, fileName]);

  const getFileLanguage = () => {
    if (!fileName) return "plaintext";
    return getLanguageFromFileName(fileName) || "plaintext";
  };

  // Show loading state if content is not ready
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        <Loader className="animate-spin h-8 w-8 text-primary mr-3" />
        <span>Loading file content...</span>
      </div>
    );
  }

  // Show empty state if no content is available
  if (content === null || content === undefined) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        No content to display
      </div>
    );
  }

  // Render the appropriate editor based on mode
  return mode === 'code' ? (
    <CodeEditor
      key={`code-${editorKey}`}
      content={content}
      language={getFileLanguage()}
      onChange={onChange}
      editorRef={editorRef}
      readOnly={readOnly}
    />
  ) : (
    <WysiwygEditor 
      key={`wysiwyg-${editorKey}`}
      content={content}
      onChange={onChange}
      editorRef={editorRef}
      // Note: readOnly is not supported by WysiwygEditor but we pass it anyway for future implementation
    />
  );
}
