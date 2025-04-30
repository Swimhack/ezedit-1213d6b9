
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
    console.log("🧪 Preview content:", content?.slice(0, 200));
    setPreviewKey(prev => prev + 1);
  }, [content, fileName]);

  return (
    <div className="h-full w-full bg-white">
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
          <span>Generating preview...</span>
        </div>
      ) : !content ? (
        <div className="flex items-center justify-center h-full text-red-500">
          <span>Failed to load content</span>
        </div>
      ) : (
        <iframe 
          key={previewKey}
          srcDoc={previewSrc} 
          className="w-full h-full border-0" 
          sandbox="allow-scripts"
          title="Preview"
        />
      )}
    </div>
  );
}
