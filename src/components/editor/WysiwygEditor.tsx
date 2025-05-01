
import React, { useEffect, useCallback, useState } from 'react';
import { TinyMCEEditor } from './TinyMCEEditor';
import { Loader } from "lucide-react";

interface WysiwygEditorProps {
  content: string;
  onChange: (content: string) => void;
  previewSelector?: string;
  editorRef?: React.MutableRefObject<any>;
}

export function WysiwygEditor({ content, onChange, previewSelector, editorRef }: WysiwygEditorProps) {
  const [editorContent, setEditorContent] = useState<string | null>(null);
  const [isEditorReady, setIsEditorReady] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  
  // Helper function to sleep
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  
  // Update internal state when content prop changes
  useEffect(() => {
    const initializeEditor = async () => {
      if (content !== undefined && typeof content === 'string' && content.trim().length > 0) {
        console.log('[WysiwygEditor] Content prop updated, length:', content?.length || 0);
        
        // Add a small delay for smoother initialization
        await sleep(100);
        
        setEditorContent(content);
        setIsEditorReady(true);
        setIsInitialized(true);
      } else {
        console.log('[WysiwygEditor] Content prop is invalid:', content);
        setIsEditorReady(false);
        setEditorContent(null);
      }
    };
    
    initializeEditor();
  }, [content]);
  
  // Handle editor content changes
  const handleChange = useCallback((newContent: string) => {
    console.log('[WysiwygEditor] Content changed, length:', newContent?.length || 0);
    setEditorContent(newContent);
    onChange(newContent);
    
    // Update preview if selector is provided
    if (previewSelector) {
      const previewFrame = document.querySelector(previewSelector) as HTMLIFrameElement;
      if (previewFrame) {
        try {
          previewFrame.srcdoc = newContent;
        } catch (err) {
          console.error('[WysiwygEditor] Error updating preview:', err);
        }
      }
    }
  }, [onChange, previewSelector]);

  if (!isEditorReady || !editorContent || typeof editorContent !== 'string') {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-background">
        <Loader className="h-6 w-6 animate-spin mr-2 mb-2 text-primary" />
        <span>Preparing editor content...</span>
      </div>
    );
  }
  
  return (
    <div className="h-full">
      {isInitialized && editorContent && (
        <TinyMCEEditor 
          key={editorContent.slice(0, 20)} // Force remount if initial content changes
          content={editorContent} 
          onChange={handleChange} 
          previewSelector={previewSelector}
          editorRef={editorRef}
        />
      )}
    </div>
  );
}
