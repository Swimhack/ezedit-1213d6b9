
import React from 'react';
import { useLivePreview } from '@/hooks/useLivePreview';

interface PreviewTabProps {
  content: string;
  fileName: string | null;
}

export function PreviewTab({ content, fileName }: PreviewTabProps) {
  const { src: previewSrc, isLoading } = useLivePreview(content, fileName || '');

  return (
    <div className="h-full w-full bg-white">
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
          <span>Generating preview...</span>
        </div>
      ) : (
        <iframe 
          srcDoc={previewSrc} 
          className="w-full h-full border-0" 
          sandbox="allow-scripts"
          title="Preview"
        />
      )}
    </div>
  );
}
