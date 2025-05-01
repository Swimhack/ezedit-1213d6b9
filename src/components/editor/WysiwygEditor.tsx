
import React, { useEffect, useCallback, useState } from 'react';
import { TinyMCEEditor } from './TinyMCEEditor';

interface WysiwygEditorProps {
  content: string;
  onChange: (content: string) => void;
  previewSelector?: string;
  editorRef?: React.MutableRefObject<any>;
}

export function WysiwygEditor({ content, onChange, previewSelector, editorRef }: WysiwygEditorProps) {
  const [editorContent, setEditorContent] = useState<string>('');
  const [isEditorReady, setIsEditorReady] = useState<boolean>(false);
  
  // Update internal state when content prop changes
  useEffect(() => {
    if (content !== undefined && typeof content === 'string') {
      console.log('[WysiwygEditor] Content prop updated, length:', content?.length || 0);
      setEditorContent(content);
      setIsEditorReady(true);
    } else {
      console.log('[WysiwygEditor] Content prop is invalid:', content);
      setIsEditorReady(false);
    }
  }, [content]);
  
  // Handle editor content changes
  const handleChange = useCallback((newContent: string) => {
    console.log('[WysiwygEditor] Content changed, length:', newContent?.length || 0);
    setEditorContent(newContent);
    onChange(newContent);
    
    // Update preview if selector is provided
    if (previewSelector) {
      const previewFrame = document.querySelector(previewSelector) as HTMLIFrameElement;
      if (previewFrame) {
        try {
          previewFrame.srcdoc = newContent;
        } catch (err) {
          console.error('[WysiwygEditor] Error updating preview:', err);
        }
      }
    }
  }, [onChange, previewSelector]);

  if (!isEditorReady || !editorContent || typeof editorContent !== 'string') {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-6 w-6 animate-spin mr-2 rounded-full border-2 border-b-transparent border-primary"></div>
        <span>Preparing editor content...</span>
      </div>
    );
  }
  
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
