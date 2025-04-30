
import React, { useEffect } from 'react';
import { TinyMCEEditor } from './TinyMCEEditor';

interface WysiwygEditorProps {
  content: string;
  onChange: (content: string) => void;
  previewSelector?: string;
  editorRef?: React.MutableRefObject<any>;
}

export function WysiwygEditor({ content, onChange, previewSelector, editorRef }: WysiwygEditorProps) {
  // Log when the component receives new content
  useEffect(() => {
    console.log('[WysiwygEditor] Received content update, length:', content?.length || 0);
  }, [content]);
  
  return (
    <div className="h-full">
      <TinyMCEEditor 
        content={content} 
        onChange={onChange} 
        previewSelector={previewSelector}
        editorRef={editorRef}
      />
    </div>
  );
}
