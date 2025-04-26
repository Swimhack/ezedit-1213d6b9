
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
      const { data, error } = await supabase.functions.invoke('ftp-download-file', {
        body: {
          host: connection.host,
          port: connection.port,
          username: connection.username,
          password: connection.password,
          path: filePath
        }
      });

      if (error) throw error;
      
      if (data.success) {
        const decodedContent = atob(data.content);
        setContent(decodedContent);
        return decodedContent;
      } else {
        throw new Error(data.message || 'Failed to load file content');
      }
    } catch (error: any) {
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
