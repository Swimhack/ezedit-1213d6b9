
import React, { useEffect, useState } from 'react';

interface PreviewProps {
  content: string;
  iframeId?: string;
}

export function Preview({ content, iframeId = "preview-iframe" }: PreviewProps) {
  const [isContentValid, setIsContentValid] = useState(false);

  // Validate content when it changes
  useEffect(() => {
    if (content && typeof content === 'string' && content.trim().length > 0) {
      console.log(`[Preview] Valid content received, length: ${content.length}`);
      setIsContentValid(true);
    } else {
      console.warn(`[Preview] Invalid or empty content received`);
      setIsContentValid(false);
    }
  }, [content]);

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
        srcDoc={content}
        title="Preview"
        className="w-full h-full border-none"
        sandbox="allow-same-origin allow-scripts"
      />
    </div>
  );
}
