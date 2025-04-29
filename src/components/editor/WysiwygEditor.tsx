
import React from 'react';
import { TinyMCEEditor } from './TinyMCEEditor';

interface WysiwygEditorProps {
  content: string;
  onChange: (content: string) => void;
  previewSelector?: string;
  editorRef?: React.MutableRefObject<any>;
}

export function WysiwygEditor({ content, onChange, previewSelector, editorRef }: WysiwygEditorProps) {
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
