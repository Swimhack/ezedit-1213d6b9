
import React from 'react';
import { TinyMCEEditor } from './TinyMCEEditor';

interface WysiwygEditorProps {
  content: string;
  onChange: (content: string) => void;
  previewSelector?: string;
}

export function WysiwygEditor({ content, onChange, previewSelector }: WysiwygEditorProps) {
  return (
    <div className="h-full">
      <TinyMCEEditor 
        content={content} 
        onChange={onChange} 
        previewSelector={previewSelector}
      />
    </div>
  );
}
