
import React, { useEffect, useCallback, useState, useRef } from 'react';
import { TinyMCEEditor } from './TinyMCEEditor';
import { Loader } from "lucide-react";

interface WysiwygEditorProps {
  content: string | null;
  onChange: (content: string) => void;
  previewSelector?: string;
  editorRef?: React.MutableRefObject<any>;
  readOnly?: boolean;
}

export function WysiwygEditor({ content, onChange, previewSelector, editorRef, readOnly = false }: WysiwygEditorProps) {
  const [isHydrated, setIsHydrated] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const internalEditorRef = useRef<any>(null);
  
  // Helper function to sleep
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  
  // Create a reference that can be used externally or internally
  const actualEditorRef = editorRef || internalEditorRef;
  
  // Function to directly inject content into editor, bypassing React's state updates
  const forceContentInjection = useCallback(async (rawContent: string) => {
    if (!rawContent || typeof rawContent !== 'string') {
      console.error('[WysiwygEditor] Cannot inject invalid content:', rawContent);
      return false;
    }
    
    if (!actualEditorRef.current) {
      console.error('[WysiwygEditor] Editor reference not available for content injection');
      return false;
    }
    
    try {
      console.log('[WysiwygEditor] Injecting content directly into editor, length:', rawContent.length);
      await sleep(50); // Small buffer for editor operations
      
      // Direct injection into the TinyMCE instance
      actualEditorRef.current.setContent(rawContent);
      return true;
    } catch (err) {
      console.error('[WysiwygEditor] Content injection failed:', err);
      return false;
    }
  }, [actualEditorRef]);
  
  // Expose the force injection method through the ref
  useEffect(() => {
    if (actualEditorRef && !actualEditorRef.current) {
      actualEditorRef.current = {};
    }
    
    if (actualEditorRef.current) {
      actualEditorRef.current.forceContentInjection = forceContentInjection;
    }
  }, [actualEditorRef, forceContentInjection]);
  
  // Initialize editor when content is available
  useEffect(() => {
    const initializeEditor = async () => {
      if (content !== null && typeof content === 'string' && content.trim().length > 0) {
        console.log('[WysiwygEditor] Content available for initialization, length:', content.length);
        
        // Add a small delay for smoother initialization
        await sleep(100);
        
        setIsInitialized(true);
        
        // Attempt direct content injection if editor is already available
        if (actualEditorRef.current && typeof actualEditorRef.current.setContent === 'function') {
          try {
            console.log('[WysiwygEditor] Direct editor injection on initialization');
            actualEditorRef.current.setContent(content);
            setIsHydrated(true);
          } catch (err) {
            console.error('[WysiwygEditor] Error during direct injection on init:', err);
          }
        }
      } else {
        console.warn('[WysiwygEditor] Content is invalid:', content);
        setIsInitialized(false);
        setIsHydrated(false);
      }
    };
    
    initializeEditor();
  }, [content, actualEditorRef]);
  
  // Handle editor content changes
  const handleChange = useCallback((newContent: string) => {
    console.log('[WysiwygEditor] Content changed, length:', newContent?.length || 0);
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

  // Editor ready handler - called when TinyMCE is fully initialized
  const handleEditorReady = useCallback((editor: any) => {
    console.log('[WysiwygEditor] Editor instance is ready');
    if (actualEditorRef.current) {
      // Enhance the ref with the actual editor instance
      Object.assign(actualEditorRef.current, editor);
    }
    
    // If we have content ready, inject it now
    if (content && typeof content === 'string') {
      try {
        editor.setContent(content);
        console.log('[WysiwygEditor] Content injected on editor ready');
        setIsHydrated(true);
      } catch (err) {
        console.error('[WysiwygEditor] Failed to inject content on ready:', err);
      }
    }
  }, [content, actualEditorRef]);

  // If content is not ready, show a loading state
  if (!isInitialized || !content) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-background">
        <Loader className="h-6 w-6 animate-spin mr-2 mb-2 text-primary" />
        <span>Preparing editor content...</span>
      </div>
    );
  }
  
  // Render the editor in a container that can be visually disabled until content is hydrated
  return (
    <div className={`h-full editor-container ${isHydrated ? 'editor-active' : 'editor-frozen'}`}>
      <style>{`
        .editor-frozen {
          position: relative;
          pointer-events: ${readOnly ? 'none' : 'auto'};
          opacity: ${isHydrated ? 1 : 0.7};
        }
        
        .editor-active {
          position: relative;
        }
      `}</style>
      
      <TinyMCEEditor 
        key={isInitialized ? `editor-${Date.now()}` : 'loading'} 
        content={content} 
        onChange={handleChange} 
        previewSelector={previewSelector}
        editorRef={actualEditorRef}
        onEditorReady={handleEditorReady}
        readOnly={readOnly || !isHydrated}
      />
      
      {!isHydrated && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50">
          <div className="flex flex-col items-center">
            <Loader className="h-8 w-8 animate-spin mb-2 text-primary" />
            <span>Content is loading...</span>
          </div>
        </div>
      )}
    </div>
  );
}
