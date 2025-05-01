
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
  const [editorContent, setEditorContent] = useState<string>('');
  const [isContentReady, setIsContentReady] = useState<boolean>(false);

  // Fetch and load the file content when path changes
  useEffect(() => {
    if (filePath) {
      loadFileContent(filePath);
    }
  }, [filePath]);

  // Update internal state when code prop changes (if it's different from what we already have)
  useEffect(() => {
    if (code !== undefined && typeof code === 'string' && code !== editorContent) {
      console.log('[WysiwygWrapper] Code prop updated, length:', code?.length || 0);
      setEditorContent(code);
      setIsContentReady(true);
      
      // Update preview
      updatePreview(code);
    }
  }, [code]);

  const updatePreview = (content: string) => {
    if (!previewIframeId) return;
    
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

  const loadFileContent = async (path: string) => {
    console.log(`[WysiwygWrapper] Loading file content: ${path}`);
    setIsContentReady(false);
    
    try {
      const res = await fetch(`/api/readFile?path=${encodeURIComponent(path)}&t=${Date.now()}`, {
        method: "GET",
        cache: "no-store",
        headers: { "Pragma": "no-cache", "Cache-Control": "no-cache" },
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}: ${res.statusText}`);
      }
      
      const content = await res.text();
      console.log(`[WysiwygWrapper] File content loaded, length: ${content.length}`);
      
      setEditorContent(content);
      setIsContentReady(true);
      onCodeChange(content); // Update parent component
      
      // Update preview
      updatePreview(content);
    } catch (err) {
      console.error(`[WysiwygWrapper] Error loading file: ${path}`, err);
      setIsContentReady(false);
    }
  };

  const handleEditorChange = useCallback((newContent: string) => {
    console.log('[WysiwygWrapper] TinyMCE content changed, length:', newContent?.length || 0);
    setEditorContent(newContent);
    onCodeChange(newContent);
    
    // Update preview
    updatePreview(newContent);
  }, [onCodeChange, previewIframeId]);

  if (!isContentReady || !editorContent || typeof editorContent !== 'string') {
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
