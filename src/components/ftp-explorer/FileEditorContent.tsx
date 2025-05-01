
import React, { useState } from "react";
import { SplitEditor } from "@/components/editor/SplitEditor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EditorStateDisplay } from "@/components/editor/EditorStateDisplay";
import { Loader } from "lucide-react";

interface FileEditorContentProps {
  filePath: string;
  content: string | null;
  onContentChange: (content: string) => void;
  onApplyResponse?: (text: string) => void;
  showKlein?: boolean;
  readOnly?: boolean;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function FileEditorContent({
  filePath,
  content,
  onContentChange,
  onApplyResponse,
  showKlein = true,
  readOnly = false,
  isLoading = false,
  error = null,
  onRetry,
}: FileEditorContentProps) {
  const [activeTab, setActiveTab] = React.useState("editor");
  
  // Use the content prop as the source of truth for the editor
  const editorRef = React.useRef<any>(null);
  
  // If there's an error or loading state, show the appropriate display
  if (error) {
    return (
      <EditorStateDisplay
        isLoading={false}
        error={error}
        onRetry={onRetry}
        filePath={filePath}
      />
    );
  }
  
  // Show loading state separately
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Loader className="h-8 w-8 animate-spin text-primary mb-3" />
        <span className="text-center text-muted-foreground">
          Loading file from server... Please wait.
        </span>
      </div>
    );
  }
  
  // If there's no file selected, show an empty state
  if (!filePath) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">
          <p>Select a file from the file tree to edit</p>
        </div>
      </div>
    );
  }

  // If content is null or undefined, show a meaningful message
  if (content === null || content === undefined) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">
          <p>File content could not be loaded</p>
          {onRetry && (
            <button 
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              onClick={onRetry}
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1">
        <SplitEditor
          key={`${filePath}-${content.slice(0, 20)}`} // Force remount on content or file change
          fileName={filePath}
          content={content}
          onChange={onContentChange}
          editorRef={editorRef}
          readOnly={readOnly}
          error={error}
        />
      </div>
      {content && (
        <div className="px-2 py-1 text-xs text-right text-muted-foreground border-t">
          File loaded. Ready to edit.
        </div>
      )}
    </div>
  );
}
