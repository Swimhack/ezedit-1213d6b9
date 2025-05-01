
import { useState, useEffect, useRef } from "react";
import { CodeEditor } from "./CodeEditor";
import { WysiwygEditor } from "./WysiwygEditor";
import { getLanguageFromFileName } from "@/utils/language-detector";
import { Loader, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface EditorViewProps {
  mode: 'code' | 'wysiwyg';
  content: string | null;
  fileName: string | null;
  onChange: (content: string) => void;
  editorRef?: React.MutableRefObject<any>;
  isLoading?: boolean;
  readOnly?: boolean;
}

export function EditorView({
  mode,
  content,
  fileName,
  onChange,
  editorRef,
  isLoading = false,
  readOnly = false
}: EditorViewProps) {
  // Create a local ref if none is provided
  const localEditorRef = useRef<any>(null);
  const actualEditorRef = editorRef || localEditorRef;
  
  // Track editor hydration state
  const [isHydrated, setIsHydrated] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>("Initializing editor...");

  // Function to retry loading content into the editor
  const retryContentLoad = async () => {
    if (!content) {
      setStatusMessage("No content available to load");
      return;
    }
    
    setIsHydrated(false);
    setHasError(false);
    setStatusMessage("Retrying content load...");
    
    try {
      // Ensure we have an editor reference
      if (!actualEditorRef.current) {
        console.error("[EditorView] Editor reference not available for retry");
        throw new Error("Editor not initialized");
      }
      
      // Use the force injection method if available
      if (actualEditorRef.current.forceContentInjection) {
        const success = await actualEditorRef.current.forceContentInjection(content);
        if (success) {
          setIsHydrated(true);
          setStatusMessage("Content loaded successfully");
          toast.success("Editor content refreshed");
        } else {
          throw new Error("Content injection failed");
        }
      } else if (mode === 'code' && actualEditorRef.current.setValue) {
        // For code editor
        actualEditorRef.current.setValue(content);
        setIsHydrated(true);
        setStatusMessage("Code loaded successfully");
      } else {
        throw new Error("No suitable method to inject content");
      }
    } catch (error) {
      console.error("[EditorView] Retry failed:", error);
      setHasError(true);
      setStatusMessage("Failed to load content. Please try again.");
      toast.error("Failed to refresh editor content");
    }
  };

  // Handle content changes and hydration state
  useEffect(() => {
    const handleContentUpdate = async () => {
      if (content && !isLoading) {
        setStatusMessage("Processing content...");
        
        try {
          // For WYSIWYG, we rely on the component's internal handling
          if (mode === 'wysiwyg') {
            // The WysiwygEditor component will handle hydration internally
            setStatusMessage("Preparing rich text editor...");
          } 
          // For code editor, we can set content directly
          else if (mode === 'code' && actualEditorRef.current) {
            try {
              actualEditorRef.current.setValue(content);
              setIsHydrated(true);
              setStatusMessage("Code loaded successfully");
            } catch (error) {
              console.error("[EditorView] Failed to set code content:", error);
              setHasError(true);
              setStatusMessage("Error setting code content");
            }
          }
        } catch (error) {
          console.error("[EditorView] Content update error:", error);
          setHasError(true);
          setStatusMessage("Failed to process content");
        }
      } else if (!content && !isLoading) {
        setIsHydrated(false);
        setStatusMessage("No content available");
      }
    };

    handleContentUpdate();
  }, [content, isLoading, mode, actualEditorRef]);

  const getFileLanguage = () => {
    if (!fileName) return "plaintext";
    return getLanguageFromFileName(fileName) || "plaintext";
  };

  // Show loading state if content is not ready
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        <Loader className="animate-spin h-8 w-8 text-primary mr-3" />
        <span>Loading file content...</span>
      </div>
    );
  }

  // Show empty state if no content is available
  if (content === null || content === undefined) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        No content to display
      </div>
    );
  }

  // Show error state
  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400">
        <AlertCircle className="h-8 w-8 text-red-500 mb-3" />
        <div className="text-red-500 font-medium mb-2">Error loading content</div>
        <p className="text-center mb-4 max-w-md">{statusMessage}</p>
        <button 
          onClick={retryContentLoad}
          className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
        >
          Retry Loading
        </button>
      </div>
    );
  }

  // Render the appropriate editor based on mode
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 relative">
        {mode === 'code' ? (
          <CodeEditor
            key={`code-${fileName}-${Date.now()}`}
            content={content}
            language={getFileLanguage()}
            onChange={onChange}
            editorRef={actualEditorRef}
            readOnly={readOnly}
          />
        ) : (
          <WysiwygEditor 
            key={`wysiwyg-${fileName}-${Date.now()}`}
            content={content}
            onChange={onChange}
            editorRef={actualEditorRef}
            readOnly={readOnly}
          />
        )}
      </div>
      
      <div className="px-2 py-1 text-xs text-right text-muted-foreground border-t">
        {isHydrated ? "File loaded. Ready to edit." : "Waiting for editor to stabilize..."}
      </div>
    </div>
  );
}
