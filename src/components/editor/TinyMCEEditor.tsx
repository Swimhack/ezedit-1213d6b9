
import React, { useEffect, useRef, useState } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { useTheme } from "@/hooks/use-theme";

interface TinyMCEEditorProps {
  content: string;
  onChange: (content: string) => void;
  height?: string;
  previewSelector?: string; // Optional selector for preview iframe
  editorRef?: React.MutableRefObject<any>;
}

export function TinyMCEEditor({ 
  content, 
  onChange, 
  height = "100%",
  previewSelector,
  editorRef: externalEditorRef
}: TinyMCEEditorProps) {
  const internalEditorRef = useRef<any>(null);
  const editorRef = externalEditorRef || internalEditorRef;
  const { theme } = useTheme();
  const [editorInitialized, setEditorInitialized] = useState<boolean>(false);
  
  // Use the provided API key directly
  const apiKey = "q8smw06bbgh2t6wcki98o8ja4l5bco8g7k6tgfapjboh81tv";
  
  // Check if content is valid
  if (!content || typeof content !== 'string') {
    console.error('[TinyMCE] Invalid content provided:', content);
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-6 w-6 animate-spin mr-2 rounded-full border-2 border-b-transparent border-primary"></div>
        <span>Waiting for valid content...</span>
      </div>
    );
  }

  return (
    <Editor
      apiKey={apiKey}
      onInit={(evt, editor) => {
        editorRef.current = editor;
        setEditorInitialized(true);
        console.log('[TinyMCE] Editor initialized');
        
        // Set content right after initialization
        setTimeout(() => {
          try {
            console.log('[TinyMCE] Setting initial content, length:', content.length);
            editor.setContent(content);
          } catch (err) {
            console.error('[TinyMCE] Error setting initial content:', err);
          }
        }, 100);
      }}
      value={content}
      onEditorChange={(newContent, editor) => {
        console.log('[TinyMCE] Content changed via onEditorChange, new length:', newContent.length);
        onChange(newContent);
      }}
      init={{
        height,
        menubar: true,
        plugins: [
          'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
          'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
          'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
        ],
        toolbar: 'undo redo | blocks | ' +
          'bold italic forecolor | alignleft aligncenter ' +
          'alignright alignjustify | bullist numlist outdent indent | ' +
          'removeformat | help',
        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
        statusbar: false,
        resize: false,
        skin: 'oxide',
        icons: 'default',
        branding: false,
        setup: function(editor) {
          editor.on('Change KeyUp Paste', function() {
            if (editorInitialized) {
              // Get current content
              const currentContent = editor.getContent();
              
              // Update preview if selector provided
              if (previewSelector) {
                const previewFrame = document.querySelector(previewSelector) as HTMLIFrameElement;
                if (previewFrame) {
                  try {
                    previewFrame.srcdoc = currentContent;
                  } catch (err) {
                    console.error('[TinyMCE] Error updating preview in editor event:', err);
                  }
                }
              }
              
              // Notify parent component
              onChange(currentContent);
            }
          });
        }
      }}
    />
  );
}
