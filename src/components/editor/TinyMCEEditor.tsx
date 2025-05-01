
import React, { useEffect, useRef, useState } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { useTheme } from "@/hooks/use-theme";
import { toast } from "sonner";
import { Loader } from "lucide-react";

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
  const [isContentValid, setIsContentValid] = useState<boolean>(false);
  const [contentSynced, setContentSynced] = useState<boolean>(false);
  const [showEditor, setShowEditor] = useState<boolean>(false);
  
  // Use the provided API key directly
  const apiKey = "q8smw06bbgh2t6wcki98o8ja4l5bco8g7k6tgfapjboh81tv";

  // Helper function to sleep
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Strictly validate content on mount and when it changes
  useEffect(() => {
    const validateContent = async () => {
      if (content && typeof content === 'string' && content.trim().length > 0) {
        console.log('[TinyMCE] Content validated, length:', content.length);
        
        // Add a small delay for smoother UX
        await sleep(100);
        
        setIsContentValid(true);
        setShowEditor(true);
      } else {
        console.error('[TinyMCE] Invalid content provided:', content);
        setIsContentValid(false);
        setShowEditor(false);
      }
    };
    
    validateContent();
  }, [content]);

  // Update editor content when prop changes and content is valid
  useEffect(() => {
    const updateEditorContent = async () => {
      if (editorInitialized && editorRef.current && isContentValid) {
        try {
          console.log('[TinyMCE] Content prop changed, updating editor content. Length:', content.length);
          
          // Add a small delay for smoother UX
          await sleep(50);
          
          editorRef.current.setContent(content);
          setContentSynced(true);
          console.log('[TinyMCE] Editor content successfully updated');
        } catch (err) {
          console.error('[TinyMCE] Error updating editor content:', err);
          toast.error("Error updating editor with file content");
        }
      }
    };
    
    updateEditorContent();
  }, [content, editorInitialized, editorRef, isContentValid]);
  
  // Check if content is valid before rendering editor
  if (!isContentValid || !showEditor) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="h-6 w-6 animate-spin mr-2 text-primary" />
        <span>Waiting for valid file content...</span>
      </div>
    );
  }

  return (
    <Editor
      key={`editor-${content.slice(0, 20)}`} // Force remount if content significantly changes
      apiKey={apiKey}
      onInit={(evt, editor) => {
        editorRef.current = editor;
        setEditorInitialized(true);
        console.log('[TinyMCE] Editor initialized');
        
        // Force set content right after initialization if it's valid
        try {
          if (isContentValid) {
            console.log('[TinyMCE] Setting initial content, length:', content.length);
            setTimeout(() => {
              editor.setContent(content);
              setContentSynced(true);
              console.log('[TinyMCE] Initial content set with timeout');
            }, 50);
          }
        } catch (err) {
          console.error('[TinyMCE] Error setting initial content:', err);
          toast.error("Error initializing editor with file content");
        }
      }}
      initialValue={content}
      onEditorChange={(newContent, editor) => {
        if (newContent && newContent.trim().length > 0) {
          console.log('[TinyMCE] Content changed via onEditorChange, new length:', newContent.length);
          onChange(newContent);
          
          // Update preview if selector provided
          if (previewSelector && editorInitialized) {
            const previewFrame = document.querySelector(previewSelector) as HTMLIFrameElement;
            if (previewFrame) {
              try {
                previewFrame.srcdoc = newContent;
              } catch (err) {
                console.error('[TinyMCE] Error updating preview:', err);
              }
            }
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
        skin: theme === 'dark' ? 'oxide-dark' : 'oxide',
        content_css: theme === 'dark' ? 'dark' : 'default',
        icons: 'default',
        branding: false
      }}
    />
  );
}
