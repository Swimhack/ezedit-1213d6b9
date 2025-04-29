
import React, { useEffect, useRef } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { useTheme } from "@/hooks/use-theme";

interface TinyMCEEditorProps {
  content: string;
  onChange: (content: string) => void;
  height?: string;
  previewSelector?: string; // Optional selector for preview iframe
}

export function TinyMCEEditor({ 
  content, 
  onChange, 
  height = "100%",
  previewSelector 
}: TinyMCEEditorProps) {
  const editorRef = useRef<any>(null);
  const { theme } = useTheme();

  // Use the provided API key directly
  const apiKey = "q8smw06bbgh2t6wcki98o8ja4l5bco8g7k6tgfapjboh81tv";
  
  // Effect to update editor content when prop changes from outside
  useEffect(() => {
    if (editorRef.current && content !== editorRef.current.getContent()) {
      editorRef.current.setContent(content);
    }
  }, [content]);

  // Effect to update preview iframe if selector is provided
  useEffect(() => {
    if (previewSelector && content) {
      const previewFrame = document.querySelector(previewSelector) as HTMLIFrameElement;
      if (previewFrame) {
        previewFrame.srcdoc = content;
      }
    }
  }, [content, previewSelector]);

  return (
    <Editor
      apiKey={apiKey}
      onInit={(evt, editor) => {
        editorRef.current = editor;
        
        // Ensure initial content is set correctly
        if (content && editor.getContent() !== content) {
          editor.setContent(content);
        }
      }}
      initialValue={content}
      onEditorChange={(newContent) => {
        onChange(newContent);
        
        // Update preview iframe if selector is provided
        if (previewSelector) {
          const previewFrame = document.querySelector(previewSelector) as HTMLIFrameElement;
          if (previewFrame) {
            previewFrame.srcdoc = newContent;
          }
        }
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
        // Always use the light skin
        skin: 'oxide',
        icons: 'default',
      }}
    />
  );
}
