
import React, { useEffect, useCallback, useState } from "react";
import { TinyMCEEditor } from "@/components/editor/TinyMCEEditor";

interface WysiwygWrapperProps {
  code: string;
  filePath: string;
  onCodeChange: (newCode: string) => void;
  editorRef: React.MutableRefObject<any>;
  previewIframeId: string;
}

export function WysiwygWrapper({
  code,
  filePath,
  onCodeChange,
  editorRef,
  previewIframeId
}: WysiwygWrapperProps) {
  const [editorContent, setEditorContent] = useState<string>(code || '');
  const [isContentReady, setIsContentReady] = useState<boolean>(false);

  // Update internal state when code prop changes
  useEffect(() => {
    if (code !== undefined) {
      console.log('[WysiwygWrapper] Code prop updated, length:', code?.length || 0);
      setEditorContent(code);
      setIsContentReady(true);
    }
  }, [code]);

  const handleEditorChange = useCallback((newContent: string) => {
    console.log('[WysiwygWrapper] TinyMCE content changed, length:', newContent?.length || 0);
    setEditorContent(newContent);
    onCodeChange(newContent);
  }, [onCodeChange]);

  if (!isContentReady || typeof editorContent !== 'string') {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-6 w-6 animate-spin mr-2 rounded-full border-2 border-b-transparent border-primary"></div>
        <span>Preparing editor content...</span>
      </div>
    );
  }

  return (
    <div className="h-full">
      <TinyMCEEditor
        content={editorContent}
        onChange={handleEditorChange}
        height="100%"
        previewSelector={`#${previewIframeId}`}
        editorRef={editorRef}
      />
    </div>
  );
}
