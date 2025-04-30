
import React, { useEffect, useCallback } from "react";
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
  // Log when the component receives new code
  useEffect(() => {
    console.log('[WysiwygWrapper] Received new code, length:', code?.length || 0);
    
    // Force editor update if the editor is already initialized and we have a new code
    if (editorRef.current && editorRef.current.setContent && code) {
      try {
        console.log('[WysiwygWrapper] Forcing content update after code change');
        editorRef.current.setContent(code);
      } catch (err) {
        console.error('[WysiwygWrapper] Error forcing content update:', err);
      }
    }
  }, [code, editorRef]);

  const handleEditorChange = useCallback((newContent: string) => {
    console.log('[WysiwygWrapper] TinyMCE content changed, length:', newContent.length);
    onCodeChange(newContent);
  }, [onCodeChange]);

  return (
    <div className="h-full">
      <TinyMCEEditor
        content={code}
        onChange={handleEditorChange}
        height="100%"
        previewSelector={`#${previewIframeId}`}
        editorRef={editorRef}
      />
    </div>
  );
}
