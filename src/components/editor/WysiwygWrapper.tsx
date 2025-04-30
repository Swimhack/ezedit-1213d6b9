
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

  // Update internal state when code prop changes
  useEffect(() => {
    if (code !== undefined && code !== editorContent) {
      console.log('[WysiwygWrapper] Code prop updated, length:', code?.length || 0);
      setEditorContent(code);
    }
  }, [code]);

  // Force editor update when ref changes
  useEffect(() => {
    if (editorRef.current && editorRef.current.setContent && editorContent) {
      try {
        console.log('[WysiwygWrapper] Forcing content update after editorRef change');
        editorRef.current.setContent(editorContent);
      } catch (err) {
        console.error('[WysiwygWrapper] Error forcing content update:', err);
      }
    }
  }, [editorRef]);

  const handleEditorChange = useCallback((newContent: string) => {
    console.log('[WysiwygWrapper] TinyMCE content changed, length:', newContent?.length || 0);
    setEditorContent(newContent);
    onCodeChange(newContent);
  }, [onCodeChange]);

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
