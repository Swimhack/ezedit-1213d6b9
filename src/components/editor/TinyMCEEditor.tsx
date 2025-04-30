
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
  const contentRef = useRef<string>(content || "");

  // Use the provided API key directly
  const apiKey = "q8smw06bbgh2t6wcki98o8ja4l5bco8g7k6tgfapjboh81tv";
  
  // Update contentRef when content prop changes
  useEffect(() => {
    contentRef.current = content || "";
    
    // Update editor content if editor is initialized and content has changed
    if (editorRef.current && editorInitialized && content !== undefined) {
      try {
        console.log('[TinyMCE] External content updated, length:', content?.length || 0);
        
        // Safely check if the editor is ready
        if (editorRef.current.setContent) {
          console.log('[TinyMCE] Applying new content to editor');
          editorRef.current.setContent(content);
        } else if (editorRef.current.editor && typeof editorRef.current.editor.setContent === 'function') {
          console.log('[TinyMCE] Applying new content to editor.editor');
          editorRef.current.editor.setContent(content);
        } else {
          console.warn('[TinyMCE] Editor reference exists but setContent method not found');
        }
      } catch (err) {
        console.error('[TinyMCE] Error accessing editor methods:', err);
      }
    }
  }, [content, editorRef, editorInitialized]);

  // Effect to update preview iframe if selector is provided
  useEffect(() => {
    if (previewSelector && content) {
      const previewFrame = document.querySelector(previewSelector) as HTMLIFrameElement;
      if (previewFrame) {
        try {
          previewFrame.srcdoc = content;
        } catch (err) {
          console.error('[TinyMCE] Error updating preview iframe:', err);
        }
      }
    }
  }, [content, previewSelector]);

  return (
    <Editor
      apiKey={apiKey}
      onInit={(evt, editor) => {
        editorRef.current = editor;
        setEditorInitialized(true);
        console.log('[TinyMCE] Editor initialized');
        
        // Ensure initial content is set correctly after editor is fully initialized
        if (contentRef.current) {
          setTimeout(() => {
            try {
              console.log('[TinyMCE] Setting initial content, length:', contentRef.current.length);
              editor.setContent(contentRef.current);
            } catch (err) {
              console.error('[TinyMCE] Error setting initial content:', err);
            }
          }, 100);
        }
      }}
      initialValue={content} // Set initial value directly
      value={content} // Control the editor with value prop
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
        // Always use the light skin
        skin: 'oxide',
        icons: 'default',
        branding: false,
        // Add setup function to sync with preview
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
