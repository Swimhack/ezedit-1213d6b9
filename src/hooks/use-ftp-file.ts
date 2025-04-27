
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
      
      // Use the ftp-get-file function
      const { data, error } = await supabase.functions.invoke('ftp-get-file', {
        body: {
          siteId: connection.id,
          path: filePath
        }
      });

      if (error) {
        console.error("Error from edge function:", error);
        const errorMessage = error.message || "Failed to load file";
        setError(errorMessage);
        toast.error(`Error loading file: ${errorMessage}`);
        throw error;
      }
      
      if (data && data.success) {
        console.log(`File content received, decoding...`);
        const decodedContent = atob(data.content);
        setContent(decodedContent);
        return decodedContent;
      } else {
        const errorMessage = data?.message || data?.error || 'Unknown error';
        console.error("Error in response:", data);
        setError(errorMessage);
        toast.error(`Error loading file: ${errorMessage}`);
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error("File loading error:", error);
      const errorMessage = error.message || "Failed to load file";
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
