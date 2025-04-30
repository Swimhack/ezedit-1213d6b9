
import React, { useEffect, useCallback, useState } from 'react';
import { TinyMCEEditor } from './TinyMCEEditor';

interface WysiwygEditorProps {
  content: string;
  onChange: (content: string) => void;
  previewSelector?: string;
  editorRef?: React.MutableRefObject<any>;
}

export function WysiwygEditor({ content, onChange, previewSelector, editorRef }: WysiwygEditorProps) {
  const [editorContent, setEditorContent] = useState<string>(content || '');
  
  // Update internal state when content prop changes
  useEffect(() => {
    if (content !== undefined) {
      console.log('[WysiwygEditor] Content prop updated, length:', content?.length || 0);
      setEditorContent(content);
    }
  }, [content]);
  
  // Handle editor content changes
  const handleChange = useCallback((newContent: string) => {
    console.log('[WysiwygEditor] Content changed, length:', newContent?.length || 0);
    setEditorContent(newContent);
    onChange(newContent);
  }, [onChange]);
  
  return (
    <div className="h-full">
      <TinyMCEEditor 
        content={editorContent} 
        onChange={handleChange} 
        previewSelector={previewSelector}
        editorRef={editorRef}
      />
    </div>
  );
}
