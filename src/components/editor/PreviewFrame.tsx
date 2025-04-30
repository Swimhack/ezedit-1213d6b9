
import React, { useState, useEffect } from "react";
import { Loader } from "lucide-react";

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
  if (!contentReady) {
    return (
      <div className="flex items-center justify-center h-[calc(100%-28px)]">
        <Loader className="h-6 w-6 animate-spin text-gray-400" />
        <span className="ml-2">Waiting for content...</span>
      </div>
    );
  }
  
  if (code === "") {
    return (
      <div className="flex items-center justify-center h-[calc(100%-28px)] text-gray-500">
        Empty file – nothing to preview
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100%-28px)]">
        <Loader className="h-6 w-6 animate-spin text-gray-400" />
        <span className="ml-2">Generating preview...</span>
      </div>
    );
  }
  
  return (
    <iframe
      id={previewIframeId}
      key={previewKey}
      srcDoc={previewSrc}
      className="w-full h-[calc(100%-28px)] border-none"
      sandbox="allow-scripts"
      title="Preview"
    />
  );
}
