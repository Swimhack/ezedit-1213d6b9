
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
  const [lastExternalContent, setLastExternalContent] = useState<string>(content || "");

  // Use the provided API key directly
  const apiKey = "q8smw06bbgh2t6wcki98o8ja4l5bco8g7k6tgfapjboh81tv";
  
  // Effect to update editor content when prop changes from outside
  useEffect(() => {
    // Only update if the external content has actually changed
    if (editorRef.current && editorInitialized && content !== lastExternalContent) {
      try {
        console.log('[TinyMCE] External content updated, length:', content?.length || 0);
        setLastExternalContent(content || "");
        
        // Safely check if the editor is ready
        if (editorRef.current.setContent) {
          editorRef.current.setContent(content || "");
          setInternalContent(content || "");
        } else if (editorRef.current.editor && typeof editorRef.current.editor.setContent === 'function') {
          editorRef.current.editor.setContent(content || "");
          setInternalContent(content || "");
        } else {
          console.warn('[TinyMCE] Editor reference exists but setContent method not found');
        }
      } catch (err) {
        console.error('[TinyMCE] Error accessing editor methods:', err);
      }
    }
  }, [content, editorRef, editorInitialized, lastExternalContent]);

  // Effect to update preview iframe if selector is provided
  useEffect(() => {
    if (previewSelector && internalContent) {
      const previewFrame = document.querySelector(previewSelector) as HTMLIFrameElement;
      if (previewFrame) {
        try {
          previewFrame.srcdoc = internalContent;
        } catch (err) {
          console.error('[TinyMCE] Error updating preview iframe:', err);
        }
      }
    }
  }, [internalContent, previewSelector]);

  // Forcibly update the editor content when it changes externally
  const forceContentUpdate = () => {
    if (editorRef.current && editorInitialized && content) {
      try {
        console.log('[TinyMCE] Force updating content, length:', content.length);
        editorRef.current.setContent(content);
        setInternalContent(content);
        setLastExternalContent(content);
      } catch (err) {
        console.error('[TinyMCE] Error force updating content:', err);
      }
    }
  };

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
              setLastExternalContent(content);
            } catch (err) {
              console.error('[TinyMCE] Error setting initial content:', err);
            }
          }, 100);
        }
      }}
      value={content}
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
        branding: false,
        // Add setup function to sync with preview
        setup: function(editor) {
          editor.on('Change KeyUp', function() {
            if (editorInitialized) {
              // Get current content
              const currentContent = editor.getContent();
              
              // Only update if content has changed
              if (currentContent !== internalContent) {
                console.log('[TinyMCE] Content changed via editor event');
                setInternalContent(currentContent);
                onChange(currentContent);
                
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
              }
            }
          });
        }
      }}
    />
  );
}
