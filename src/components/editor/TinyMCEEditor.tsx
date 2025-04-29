
import React, { useEffect, useRef } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { useTheme } from "@/hooks/use-theme";

interface TinyMCEEditorProps {
  content: string;
  onChange: (content: string) => void;
  height?: string;
}

export function TinyMCEEditor({ content, onChange, height = "100%" }: TinyMCEEditorProps) {
  const editorRef = useRef<any>(null);
  const { theme } = useTheme();

  // Check if window.ENV exists and has the TinyMCE API key
  const apiKey = typeof window !== "undefined" && window.ENV?.TINYMCE_API_KEY 
    ? window.ENV.TINYMCE_API_KEY 
    : "your-api-key"; // Fallback to a default or empty key

  return (
    <Editor
      apiKey={apiKey}
      onInit={(evt, editor) => (editorRef.current = editor)}
      initialValue={content}
      onEditorChange={(newContent) => {
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
        // Always use the light skin
        skin: 'oxide',
        icons: 'default',
      }}
    />
  );
}
