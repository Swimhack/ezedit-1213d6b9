
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Hook for saving file content to FTP connections
 */
export function useFileSaver() {
  const [isSaving, setIsSaving] = useState(false);
  
  /**
   * Save file content to FTP connection
   */
  const saveFileContent = async (connectionId: string, filePath: string, content: string): Promise<{success: boolean, content: string}> => {
    if (!connectionId || !filePath || content === undefined) {
      toast.error("Missing data for saving");
      return { success: false, content: "" };
    }
    
    setIsSaving(true);
    
    try {
      console.log(`[useFileSaver] Saving file: ${filePath}, content length: ${content.length}`);
      
      const response = await fetch(`/api/saveFile`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({
          id: connectionId,
          filepath: filePath,
          content: content,
          username: "editor-user"
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to save: ${response.status} ${errorText}`);
      }
      
      console.log('[useFileSaver] Save successful');
      toast.success("File saved successfully");
      
      // After successful save, fetch the latest version to ensure consistency
      const refreshResponse = await fetch(`/api/readFile?path=${encodeURIComponent(filePath)}&t=${Date.now()}`, {
        method: "GET",
        cache: "no-store",
        headers: {
          "Pragma": "no-cache",
          "Cache-Control": "no-cache"
        }
      });
      
      if (refreshResponse.ok) {
        const refreshedContent = await refreshResponse.text();
        console.log(`[useFileSaver] Refreshed content after save, length: ${refreshedContent.length}`);
        return { success: true, content: refreshedContent };
      }
      
      // Return the content that was saved if refresh fails
      return { success: true, content: content };
    } catch (error: any) {
      console.error("[useFileSaver] Error saving file:", error);
      toast.error(`Error saving file: ${error.message}`);
      return { success: false, content: "" };
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    saveFileContent
  };
}
