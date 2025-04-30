
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useFileSave() {
  const [isSaving, setIsSaving] = useState(false);

  const saveFileContent = async (connectionId: string, filePath: string, content: string) => {
    if (!connectionId || !filePath) {
      toast.error("No file selected");
      return false;
    }

    setIsSaving(true);
    try {
      console.log(`[saveFileContent] Saving: ${filePath}`);
      console.time(`[FTP Save] ${filePath}`);
      
      const { data, error } = await supabase.functions.invoke("saveFile", {
        body: {
          id: connectionId,
          filepath: filePath,
          content: content,
          username: "webapp-user"
        }
      });

      console.timeEnd(`[FTP Save] ${filePath}`);
      
      if (error) {
        console.log('→ status: error saving, error:', error.message);
        throw error;
      }
      
      console.log('→ status: success saved');
      toast.success("File saved successfully!");
      return true;
    } catch (error: any) {
      console.log('→ status: exception saving, error:', error.message);
      toast.error(`Failed to save file: ${error.message}`);
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
