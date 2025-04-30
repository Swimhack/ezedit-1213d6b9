
import { useState } from "react";
import { saveFile } from "@/lib/ftp";
import { toast } from "sonner";

/**
 * Hook for saving file content to FTP connections
 */
export function useFileSaver() {
  const [isSaving, setIsSaving] = useState(false);
  
  /**
   * Save file content to FTP connection
   */
  const saveFileContent = async (connectionId: string, filePath: string, content: string): Promise<boolean> => {
    if (!connectionId || !filePath || content === undefined) {
      toast.error("Missing data for saving");
      return false;
    }
    
    setIsSaving(true);
    
    try {
      const { error } = await saveFile({
        id: connectionId,
        filepath: filePath,
        content: content,
        username: "editor-user"
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      toast.success("File saved successfully");
      return true;
    } catch (error: any) {
      console.error("Error saving file:", error);
      toast.error(`Error saving file: ${error.message}`);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    saveFileContent
  };
}
