
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface PreviewProps {
  content: string;
  iframeId?: string;
}

export function Preview({ content, iframeId = "preview-iframe" }: PreviewProps) {
  const [isContentValid, setIsContentValid] = useState(false);
  const [previewContent, setPreviewContent] = useState<string>('');

  // Validate content when it changes
  useEffect(() => {
    if (content && typeof content === 'string' && content.trim().length > 0) {
      console.log(`[Preview] Valid content received, length: ${content.length}`);
      console.log(`[Preview] Content preview:`, content.slice(0, 100));
      setIsContentValid(true);
      setPreviewContent(content);
    } else {
      console.warn(`[Preview] Invalid or empty content received`);
      setIsContentValid(false);
    }
  }, [content]);

  // Update iframe when content changes and is valid
  useEffect(() => {
    if (isContentValid && previewContent) {
      const previewFrame = document.getElementById(iframeId) as HTMLIFrameElement;
      if (previewFrame) {
        try {
          console.log(`[Preview] Updating iframe content, id: ${iframeId}`);
          previewFrame.srcdoc = previewContent;
        } catch (err) {
          console.error(`[Preview] Error updating iframe:`, err);
          toast.error("Error updating preview");
        }
      }
    }
  }, [isContentValid, previewContent, iframeId]);

  // Show loading state if content is not valid
  if (!isContentValid) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="h-6 w-6 animate-spin mb-2 rounded-full border-2 border-b-transparent border-primary"></div>
          <span>Waiting for valid content to preview...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-full w-full bg-white overflow-hidden">
      <iframe
        id={iframeId}
        srcDoc={previewContent}
        title="Preview"
        className="w-full h-full border-none"
        sandbox="allow-same-origin allow-scripts"
      />
    </div>
  );
}
