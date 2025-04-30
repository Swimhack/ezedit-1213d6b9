
import React, { useEffect, useCallback } from 'react';
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
    
    // Force the editor content update when new content is received
    if (editorRef?.current && editorRef.current.setContent && content) {
      try {
        console.log('[WysiwygEditor] Forcing content update after content prop change');
        editorRef.current.setContent(content);
      } catch (err) {
        console.error('[WysiwygEditor] Error forcing content update:', err);
      }
    }
  }, [content, editorRef]);
  
  const handleChange = useCallback((newContent: string) => {
    console.log('[WysiwygEditor] Content changed, length:', newContent.length);
    onChange(newContent);
  }, [onChange]);
  
  return (
    <div className="h-full">
      <TinyMCEEditor 
        content={content} 
        onChange={handleChange} 
        previewSelector={previewSelector}
        editorRef={editorRef}
      />
    </div>
  );
}
