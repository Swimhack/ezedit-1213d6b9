
import React, { useEffect } from "react";
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
  }, [code]);

  const handleEditorChange = (newContent: string) => {
    console.log('[WysiwygWrapper] TinyMCE content changed, length:', newContent.length);
    onCodeChange(newContent);
  };

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
