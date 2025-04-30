
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
    if (content !== undefined && content !== editorContent) {
      console.log('[WysiwygEditor] Content prop updated, length:', content?.length || 0);
      setEditorContent(content);
    }
  }, [content]);
  
  // Force the editor content update when editor ref changes
  useEffect(() => {
    if (editorRef?.current && editorRef.current.setContent && editorContent) {
      try {
        console.log('[WysiwygEditor] Forcing content update after editorRef change');
        editorRef.current.setContent(editorContent);
      } catch (err) {
        console.error('[WysiwygEditor] Error forcing content update:', err);
      }
    }
  }, [editorRef]);
  
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
