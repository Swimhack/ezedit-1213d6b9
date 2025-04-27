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
      console.log(`Loading file content from: ${filePath}`);
      console.time(`[SFTP] ${filePath}`);
      
      const { data, error } = await supabase.functions.invoke('sftp-file', {
        body: {
          siteId: connection.id,
          path: filePath
        }
      });

      console.timeEnd(`[SFTP] ${filePath}`);

      if (error) {
        console.error("Error from edge function:", error);
        const errorMessage = error.message || "Failed to load file";
        console.log('→ status:', 'error', 'bytes:', 0, 'error:', errorMessage);
        setError(errorMessage);
        toast.error(`Error loading file: ${errorMessage}`);
        throw error;
      }
      
      if (data && data.success) {
        const content = data.content;
        console.log('→ status:', 'success', 'bytes:', content.length, 'error:', null);
        setContent(content);
        return content;
      } else {
        const errorMessage = data?.message || data?.error || 'Unknown error';
        console.error("Error in response:", data);
        console.log('→ status:', 'error', 'bytes:', 0, 'error:', errorMessage);
        setError(errorMessage);
        toast.error(`Error loading file: ${errorMessage}`);
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error("File loading error:", error);
      const errorMessage = error.message || "Failed to load file";
      console.log('→ status:', 'exception', 'bytes:', 0, 'error:', errorMessage);
      setError(errorMessage);
      toast.error(`Error loading file: ${errorMessage}`);
      throw error;
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
