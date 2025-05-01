
import React, { useEffect, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';

interface TinyMCEEditorProps {
  content: string;
  onChange: (content: string) => void;
  previewSelector?: string;
  editorRef?: React.MutableRefObject<any>;
  onEditorReady?: (editor: any) => void;
  readOnly?: boolean;
}

export function TinyMCEEditor({ 
  content, 
  onChange, 
  previewSelector, 
  editorRef, 
  onEditorReady,
  readOnly = false
}: TinyMCEEditorProps) {
  const internalEditorRef = useRef<any>(null);
  const actualRef = editorRef || internalEditorRef;
  
  // Handle editor initialization
  const handleInit = (evt: any, editor: any) => {
    console.log('[TinyMCEEditor] Editor initialized');
    actualRef.current = editor;
    
    // Call the onEditorReady callback if provided
    if (onEditorReady && typeof onEditorReady === 'function') {
      onEditorReady(editor);
    }
  };
  
  // Handle editor change
  const handleEditorChange = (newContent: string) => {
    onChange(newContent);
  };
  
  // Configure editor to match readOnly state
  useEffect(() => {
    if (actualRef.current) {
      try {
        const editor = actualRef.current;
        if (readOnly) {
          editor.mode.set('readonly');
        } else {
          editor.mode.set('design');
        }
      } catch (err) {
        console.error('[TinyMCEEditor] Error setting editor mode:', err);
      }
    }
  }, [readOnly, actualRef]);

  return (
    <Editor
      tinymceScriptSrc="/tinymce/tinymce.min.js"
      value={content}
      init={{
        height: '100%',
        menubar: true,
        plugins: [
          'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview', 'anchor',
          'searchreplace', 'visualblocks', 'code', 'fullscreen',
          'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
        ],
        toolbar: 'undo redo | formatselect | ' +
          'bold italic backcolor | alignleft aligncenter ' +
          'alignright alignjustify | bullist numlist outdent indent | ' +
          'removeformat | help',
        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
        statusbar: true,
        browser_spellcheck: true,
        contextmenu: false,
        readonly: readOnly,
        setup: (editor) => {
          editor.on('input', () => {
            const newContent = editor.getContent();
            handleEditorChange(newContent);
          });
          
          editor.on('ExecCommand', () => {
            const newContent = editor.getContent();
            handleEditorChange(newContent);
          });
        }
      }}
      onInit={handleInit}
      onEditorChange={handleEditorChange}
      disabled={readOnly}
    />
  );
}
