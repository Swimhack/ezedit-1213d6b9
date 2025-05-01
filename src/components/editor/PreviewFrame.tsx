
import React, { useEffect } from "react";

interface PreviewFrameProps {
  previewSrc: string;
  previewKey: number;
  previewIframeId: string;
  contentReady: boolean;
  isLoading: boolean;
  code: string;
}

export function PreviewFrame({
  previewSrc,
  previewKey,
  previewIframeId,
  contentReady,
  isLoading,
  code
}: PreviewFrameProps) {
  // Effect to update iframe content directly when code changes
  useEffect(() => {
    if (!contentReady || !code || isLoading) return;
    
    const iframe = document.getElementById(previewIframeId) as HTMLIFrameElement;
    if (iframe) {
      try {
        console.log('[PreviewFrame] Updating iframe with new content');
        // Directly use the code as srcdoc - no manipulation needed
        iframe.srcdoc = code;
      } catch (err) {
        console.error('[PreviewFrame] Error updating iframe:', err);
      }
    }
  }, [code, contentReady, previewKey, previewIframeId, isLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <div className="h-6 w-6 animate-spin mr-2 rounded-full border-2 border-b-transparent border-primary"></div>
        <span>Loading preview...</span>
      </div>
    );
  }

  if (!contentReady) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <div className="h-6 w-6 animate-spin mr-2 rounded-full border-2 border-b-transparent border-primary"></div>
        <span>Preparing preview...</span>
      </div>
    );
  }

  // For HTML content, directly use the code as srcdoc without modifications
  return (
    <iframe
      id={previewIframeId}
      key={previewKey}
      srcDoc={code || previewSrc}
      className="w-full h-full border-0"
      title="Preview"
      sandbox="allow-same-origin allow-scripts allow-forms"
    />
  );
}
