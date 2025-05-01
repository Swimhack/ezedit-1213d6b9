
import React, { useEffect, useCallback, useState } from "react";
import { TinyMCEEditor } from "@/components/editor/TinyMCEEditor";

interface WysiwygWrapperProps {
  code: string;
  filePath: string;
  onCodeChange: (newCode: string) => void;
  previewIframeId: string;
  editorRef?: React.MutableRefObject<any>;
}

export function WysiwygWrapper({
  code,
  filePath,
  onCodeChange,
  previewIframeId,
  editorRef
}: WysiwygWrapperProps) {
  const [editorContent, setEditorContent] = useState<string>('');
  const [isContentReady, setIsContentReady] = useState<boolean>(false);
  const [isContentValid, setIsContentValid] = useState<boolean>(false);

  // Validate content before setting it
  const validateAndSetContent = useCallback((content: string | undefined) => {
    if (content && typeof content === 'string' && content.trim().length > 0) {
      console.log('[WysiwygWrapper] Content validated successfully, length:', content.length);
      setEditorContent(content);
      setIsContentValid(true);
      setIsContentReady(true);
      return true;
    } else {
      console.warn('[WysiwygWrapper] Invalid content received:', content);
      setIsContentValid(false);
      return false;
    }
  }, []);

  // Update internal state when code prop changes (if it's different from what we already have)
  useEffect(() => {
    if (code !== undefined && typeof code === 'string') {
      console.log('[WysiwygWrapper] Code prop updated, length:', code?.length || 0);
      
      if (validateAndSetContent(code)) {
        // Update preview only if content is valid
        updatePreview(code);
      }
    }
  }, [code, validateAndSetContent]);

  const updatePreview = (content: string) => {
    if (!previewIframeId || !content || content.trim().length === 0) return;
    
    const previewFrame = document.querySelector(`#${previewIframeId}`) as HTMLIFrameElement;
    if (previewFrame) {
      try {
        console.log('[WysiwygWrapper] Updating preview iframe with content');
        previewFrame.srcdoc = content;
      } catch (err) {
        console.error('[WysiwygWrapper] Error updating preview:', err);
      }
    }
  };

  const handleEditorChange = useCallback((newContent: string) => {
    if (newContent && typeof newContent === 'string' && newContent.trim().length > 0) {
      console.log('[WysiwygWrapper] TinyMCE content changed, length:', newContent?.length || 0);
      setEditorContent(newContent);
      onCodeChange(newContent);
      
      // Update preview
      updatePreview(newContent);
    } else {
      console.warn('[WysiwygWrapper] Editor produced invalid content, not updating');
    }
  }, [onCodeChange, previewIframeId]);

  if (!isContentReady || !isContentValid) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-6 w-6 animate-spin mr-2 rounded-full border-2 border-b-transparent border-primary"></div>
        <span>Waiting for valid content...</span>
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
