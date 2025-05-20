
import React, { useState, useEffect, useRef } from "react";
import { EditorPane } from "@/components/editor/EditorPane";
import { toast } from "sonner";

interface CodeEditorPaneProps {
  connection: any;
  filePath: string;
  onContentChange?: (content: string) => void;
}

const CodeEditorPane: React.FC<CodeEditorPaneProps> = ({
  connection,
  filePath,
  onContentChange
}) => {
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const editorRef = useRef<any>(null);

  useEffect(() => {
    if (filePath && connection) {
      loadFileContent();
    }
  }, [filePath, connection]);

  const loadFileContent = async () => {
    if (!filePath || !connection) return;
    
    setIsLoading(true);
    try {
      // This is a mock implementation
      // In a real app, this would call an API to load the file content
      console.log(`Loading file: ${filePath} from connection: ${connection.id}`);
      
      // Mock file content for demo
      const mockContent = `<!DOCTYPE html>
<html>
<head>
  <title>Mock File Content</title>
</head>
<body>
  <h1>Hello from ezEdit</h1>
  <p>This is a mock file content for ${filePath}</p>
</body>
</html>`;
      
      setTimeout(() => {
        setContent(mockContent);
        setIsLoading(false);
        setHasUnsavedChanges(false);
      }, 500);
    } catch (error: any) {
      toast.error(`Error loading file: ${error.message}`);
      setIsLoading(false);
    }
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setHasUnsavedChanges(true);
    if (onContentChange) {
      onContentChange(newContent);
    }
  };

  const handleSave = async () => {
    if (!filePath || !connection) return;
    
    setIsSaving(true);
    try {
      // Mock save implementation
      console.log(`Saving file: ${filePath} for connection: ${connection.id}`);
      console.log("Content:", content);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("File saved successfully");
      setHasUnsavedChanges(false);
    } catch (error: any) {
      toast.error(`Error saving file: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFormat = () => {
    if (!editorRef.current) return;
    try {
      editorRef.current.getAction('editor.action.formatDocument')?.run();
    } catch (error) {
      console.error("Error formatting document:", error);
    }
  };

  const handleUndo = () => {
    if (!editorRef.current) return;
    editorRef.current.trigger('keyboard', 'undo');
  };

  const handleRedo = () => {
    if (!editorRef.current) return;
    editorRef.current.trigger('keyboard', 'redo');
  };

  return (
    <div className="flex flex-col h-full">
      <EditorPane
        filePath={filePath}
        content={content}
        onChange={handleContentChange}
        onSave={handleSave}
        isLoading={isLoading}
        isSaving={isSaving}
        hasUnsavedChanges={hasUnsavedChanges}
        isPremium={true} // Usually this would come from a subscription state
        onFormat={handleFormat}
        onUndo={handleUndo}
        onRedo={handleRedo}
      />
    </div>
  );
};

export default CodeEditorPane;
