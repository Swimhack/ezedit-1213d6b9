
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useFtpFileOperations } from "./file-explorer/use-ftp-file-operations";
import { useFileSave } from "./file-explorer/use-file-save";
import { useSubscription } from "./useSubscription";

interface UseFileContentProps {
  connection: {
    id: string;
  } | null;
  filePath: string;
}

export function useFileContent({ connection, filePath }: UseFileContentProps) {
  const [content, setContent] = useState<string>("");
  const [originalContent, setOriginalContent] = useState<string>("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const { fetchFileContent, isLoading, setIsLoading } = useFtpFileOperations();
  const { saveFileContent, isSaving } = useFileSave();
  const { isPremium } = useSubscription();
  
  // Load file content when connection or file path changes
  useEffect(() => {
    const loadContent = async () => {
      if (!connection?.id || !filePath) {
        setContent("");
        setOriginalContent("");
        setError(null);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        const fileContent = await fetchFileContent(connection.id, filePath);
        setContent(fileContent);
        setOriginalContent(fileContent);
        setHasUnsavedChanges(false);
      } catch (err: any) {
        console.error("Error loading file content:", err);
        setError(err.message || "Failed to load file content");
        toast.error(`Error loading file: ${err.message || "Unknown error"}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadContent();
  }, [connection, filePath]);
  
  // Update content
  const updateContent = (newContent: string) => {
    setContent(newContent);
    setHasUnsavedChanges(newContent !== originalContent);
  };
  
  // Save content
  const saveContent = async () => {
    if (!isPremium) {
      toast.error("Premium required to save changes");
      return;
    }
    
    if (!connection?.id || !filePath) {
      toast.error("No active connection or file selected");
      return;
    }
    
    if (!hasUnsavedChanges) {
      toast.info("No changes to save");
      return;
    }
    
    try {
      const result = await saveFileContent(connection.id, filePath, content);
      
      if (result.success) {
        setOriginalContent(content);
        setHasUnsavedChanges(false);
        toast.success("File saved successfully");
      } else {
        throw new Error("Failed to save file");
      }
    } catch (err: any) {
      console.error("Error saving file:", err);
      setError(err.message || "Failed to save file");
      toast.error(`Error saving file: ${err.message || "Unknown error"}`);
    }
  };
  
  return {
    content,
    isLoading,
    isSaving,
    error,
    hasUnsavedChanges,
    updateContent,
    saveContent
  };
}
