
import React from "react";
import { SplitEditor } from "@/components/editor/SplitEditor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEditorStore } from "@/store/editorStore";

interface FileEditorContentProps {
  filePath: string;
  content: string;
  onContentChange: (content: string) => void;
  onApplyResponse?: (text: string) => void;
  showKlein?: boolean;
  readOnly?: boolean;
}

export function FileEditorContent({
  filePath,
  content,
  onContentChange,
  onApplyResponse,
  showKlein = true,
  readOnly = false,
}: FileEditorContentProps) {
  const [activeTab, setActiveTab] = React.useState("editor");
  
  // Use the content prop as the source of truth for the editor
  const editorRef = React.useRef<any>(null);
  
  // If there's no file selected, show an empty state
  if (!filePath) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-ezgray">
          <p>Select a file to view or edit</p>
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
        />
      </div>
    </div>
  );
}
