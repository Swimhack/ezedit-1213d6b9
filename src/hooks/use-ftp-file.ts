
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useFtpFile() {
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFileContent = async (connection: {
    id: string;
    host: string;
    port: number;
    username: string;
    password: string;
    root_directory?: string;
  }, filePath: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`[useFtpFile] Loading file content from: ${filePath}`);
      console.time(`[SFTP] ${filePath}`);
      
      // Use sftp-file function
      const { data, error } = await supabase.functions.invoke('sftp-file', {
        body: {
          siteId: connection.id,
          path: filePath
        }
      });

      console.timeEnd(`[SFTP] ${filePath}`);

      if (error) {
        console.error("[useFtpFile] Error from edge function:", error);
        const errorMessage = error.message || "Failed to load file";
        console.log('→ status:', 'error', 'bytes:', 0, 'error:', errorMessage);
        setError(errorMessage);
        toast.error(`Error loading file: ${errorMessage}`);
        setContent("");
        return "";
      }
      
      if (data && data.success) {
        const content = data.content || "";
        console.log(`[useFtpFile] File loaded successfully, size: ${content.length} bytes`);
        setContent(content);
        setError(null);
        return content;
      } else {
        const errorMessage = data?.message || data?.error || 'Unknown error';
        console.error("[useFtpFile] Error in response:", data);
        console.log('→ status:', 'error', 'bytes:', 0, 'error:', errorMessage);
        setError(errorMessage);
        toast.error(`Error loading file: ${errorMessage}`);
        setContent("");
        return "";
      }
    } catch (error: any) {
      console.error("[useFtpFile] File loading error:", error);
      const errorMessage = error.message || "Failed to load file";
      console.log('→ status:', 'exception', 'bytes:', 0, 'error:', errorMessage);
      setError(errorMessage);
      toast.error(`Error loading file: ${errorMessage}`);
      setContent("");
      return "";
    } finally {
      setIsLoading(false);
    }
  };

  return {
    content,
    isLoading,
    error,
    loadFileContent
  };
}
