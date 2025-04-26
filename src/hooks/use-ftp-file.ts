
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useFtpFile() {
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const loadFileContent = async (connection: {
    host: string;
    port: number;
    username: string;
    password: string;
  }, filePath: string) => {
    setIsLoading(true);
    try {
      console.log(`Loading file content from: ${filePath}`);
      
      // Use the ftp-get-file function instead of ftp-download-file
      const { data, error } = await supabase.functions.invoke('ftp-get-file', {
        body: {
          // Pass the connection ID instead of the full connection details
          siteId: connection.host, // We need to add proper site ID here
          path: filePath
        }
      });

      if (error) {
        console.error("Error from edge function:", error);
        toast.error(`Error loading file: ${error.message}`);
        throw error;
      }
      
      if (data.success) {
        console.log(`File content received, decoding...`);
        const decodedContent = atob(data.content);
        setContent(decodedContent);
        return decodedContent;
      } else {
        console.error("Error in response:", data);
        toast.error(`Error loading file: ${data.message || 'Unknown error'}`);
        throw new Error(data.message || 'Failed to load file content');
      }
    } catch (error: any) {
      console.error("File loading error:", error);
      toast.error(`Error loading file: ${error.message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    content,
    isLoading,
    loadFileContent
  };
}
