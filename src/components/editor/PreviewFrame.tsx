
import React from 'react';

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
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
        <span>Loading file...</span>
      </div>
    );
  }

  if (!contentReady || !code) {
    return (
      <div className="flex items-center justify-center h-full text-red-500">
        <span>Error: file is empty or failed to load</span>
      </div>
    );
  }

  return (
    <iframe 
      id={previewIframeId}
      key={previewKey}
      srcDoc={previewSrc}
      className="w-full h-full border-0"
      sandbox="allow-scripts"
      title="Preview"
    />
  );
}
