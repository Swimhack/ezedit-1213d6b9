
import React from "react";
import { SplitEditor } from "@/components/editor/SplitEditor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EditorStateDisplay } from "@/components/editor/EditorStateDisplay";

interface FileEditorContentProps {
  filePath: string;
  content: string;
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
  if (error || isLoading) {
    return (
      <EditorStateDisplay
        isLoading={isLoading}
        error={error}
        onRetry={onRetry}
        filePath={filePath}
      />
    );
  }
  
  // If there's no file selected, show an empty state
  if (!filePath) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-ezgray">
          <p>Select a file from the file tree to edit</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1">
        <SplitEditor
          fileName={filePath}
          content={content}
          onChange={onContentChange}
          editorRef={editorRef}
          readOnly={readOnly}
          error={error}
        />
      </div>
    </div>
  );
}
