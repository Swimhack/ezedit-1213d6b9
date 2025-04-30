
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
  const [internalContent, setInternalContent] = useState<string>(content || "");

  // Use the provided API key directly
  const apiKey = "q8smw06bbgh2t6wcki98o8ja4l5bco8g7k6tgfapjboh81tv";
  
  // Effect to update editor content when prop changes from outside
  useEffect(() => {
    if (editorRef.current && editorInitialized && content !== internalContent) {
      try {
        // Safely check if the editor is ready
        if (editorRef.current.setContent) {
          console.log('[TinyMCE] Updating content from props, length:', content?.length || 0);
          editorRef.current.setContent(content || "");
          setInternalContent(content || "");
        } else if (editorRef.current.editor && typeof editorRef.current.editor.setContent === 'function') {
          console.log('[TinyMCE] Updating content via editor instance, length:', content?.length || 0);
          editorRef.current.editor.setContent(content || "");
          setInternalContent(content || "");
        } else {
          console.warn('[TinyMCE] Editor reference exists but setContent method not found');
        }
      } catch (err) {
        console.error('[TinyMCE] Error accessing editor methods:', err);
      }
    }
  }, [content, editorRef, editorInitialized, internalContent]);

  // Effect to update preview iframe if selector is provided
  useEffect(() => {
    if (previewSelector && internalContent) {
      const previewFrame = document.querySelector(previewSelector) as HTMLIFrameElement;
      if (previewFrame) {
        console.log('[TinyMCE] Updating preview iframe');
        try {
          previewFrame.srcdoc = internalContent;
        } catch (err) {
          console.error('[TinyMCE] Error updating preview iframe:', err);
        }
      } else {
        console.warn('[TinyMCE] Preview selector provided but element not found:', previewSelector);
      }
    }
  }, [internalContent, previewSelector]);

  return (
    <Editor
      apiKey={apiKey}
      onInit={(evt, editor) => {
        editorRef.current = editor;
        setEditorInitialized(true);
        console.log('[TinyMCE] Editor initialized');
        
        // Ensure initial content is set correctly after editor is fully initialized
        if (content) {
          setTimeout(() => {
            try {
              console.log('[TinyMCE] Setting initial content, length:', content.length);
              editor.setContent(content);
              setInternalContent(content);
            } catch (err) {
              console.error('[TinyMCE] Error setting initial content:', err);
            }
          }, 100);
        }
        
        // Log errors from TinyMCE
        editor.on('LogError', function(e) {
          console.error('[TinyMCE] Editor error:', e);
        });
      }}
      initialValue={content}
      onEditorChange={(newContent, editor) => {
        // Only trigger onChange if content actually changed to prevent loops
        if (newContent !== internalContent) {
          console.log('[TinyMCE] Content changed via onEditorChange, new length:', newContent.length);
          setInternalContent(newContent);
          onChange(newContent);
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
        // Add setup function to sync with preview
        setup: function(editor) {
          editor.on('Change KeyUp', function() {
            if (editorInitialized) {
              // Log that content has changed
              console.log('[TinyMCE] Content changed via editor event');
              
              // Update preview if selector provided
              if (previewSelector) {
                const previewFrame = document.querySelector(previewSelector) as HTMLIFrameElement;
                if (previewFrame) {
                  try {
                    const content = editor.getContent();
                    previewFrame.srcdoc = content;
                    setInternalContent(content);
                  } catch (err) {
                    console.error('[TinyMCE] Error updating preview in editor event:', err);
                  }
                }
              }
            }
          });
          
          // Log when editor is fully initialized
          editor.on('init', function() {
            console.log('[TinyMCE] Editor init event fired');
          });
          
          editor.on('error', function(e) {
            console.error('[TinyMCE] Editor error event:', e);
          });
        }
      }}
    />
  );
}
