
import React, { useEffect, useCallback, useState } from "react";
import { TinyMCEEditor } from "@/components/editor/TinyMCEEditor";
import { toast } from "sonner";
import { Loader } from "lucide-react";

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
  const [editorContent, setEditorContent] = useState<string | null>(null);
  const [isContentReady, setIsContentReady] = useState<boolean>(false);
  const [isContentValid, setIsContentValid] = useState<boolean>(false);

  // Sleep helper function
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Validate content before setting it
  const validateAndSetContent = useCallback(async (content: string | undefined) => {
    if (content && typeof content === 'string' && content.trim().length > 0) {
      console.log('[WysiwygWrapper] Content validated successfully, length:', content.length);
      
      // Small delay for smoother UX
      await sleep(100);
      
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

  // Update internal state when code prop changes
  useEffect(() => {
    const initializeContent = async () => {
      if (code !== undefined && typeof code === 'string') {
        console.log('[WysiwygWrapper] Code prop updated, length:', code?.length || 0);
        
        if (await validateAndSetContent(code)) {
          // Update preview only if content is valid
          updatePreview(code);
        }
      }
    };
    
    initializeContent();
  }, [code, validateAndSetContent]);

  // Update preview with content
  const updatePreview = useCallback((content: string) => {
    if (!previewIframeId || !content || content.trim().length === 0) return;
    
    const previewFrame = document.querySelector(`#${previewIframeId}`) as HTMLIFrameElement;
    if (previewFrame) {
      try {
        console.log('[WysiwygWrapper] Updating preview iframe with content');
        previewFrame.srcdoc = content;
      } catch (err) {
        console.error('[WysiwygWrapper] Error updating preview:', err);
        toast.error("Error updating preview");
      }
    }
  }, [previewIframeId]);

  // Handle editor content changes
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
  }, [onCodeChange, updatePreview]);

  // Show loading state if content is not ready or valid
  if (!isContentReady || !isContentValid) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="h-6 w-6 animate-spin mr-2 text-primary" />
        <span>Waiting for valid content...</span>
      </div>
    );
  }

  return (
    <div className="h-full">
      {editorContent && isContentValid && (
        <TinyMCEEditor
          key={`wysiwyg-${filePath}-${editorContent.slice(0, 20)}`} // Force remount on file or content change
          content={editorContent}
          onChange={handleEditorChange}
          previewSelector={`#${previewIframeId}`}
          editorRef={editorRef}
        />
      )}
    </div>
  );
}
