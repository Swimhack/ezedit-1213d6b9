
import React, { useEffect, useState } from 'react';
import { useLivePreview } from '@/hooks/useLivePreview';

interface PreviewTabProps {
  content: string;
  fileName: string | null;
}

export function PreviewTab({ content, fileName }: PreviewTabProps) {
  const [previewKey, setPreviewKey] = useState(0);
  const { src: previewSrc, isLoading } = useLivePreview(content, fileName || '');
  
  // Force refresh preview when content changes
  useEffect(() => {
    console.log("[PreviewTab] Content updated, forcing preview refresh");
    setPreviewKey(prev => prev + 1);
  }, [content, fileName]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
        <span>Loading file...</span>
      </div>
    );
  }

  if (!previewSrc) {
    return (
      <div className="flex items-center justify-center h-full text-red-500">
        <span>Error: file is empty or failed to load</span>
      </div>
    );
  }

  return (
    <iframe 
      key={previewKey}
      srcDoc={previewSrc} 
      className="w-full h-full border-0" 
      sandbox="allow-scripts"
      title="Preview"
    />
  );
}
