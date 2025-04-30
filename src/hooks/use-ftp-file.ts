
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
      
      // Try the sftp-file function first for better reliability
      const response = await supabase.functions.invoke('sftp-file', {
        body: {
          siteId: connection.id,
          path: filePath
        }
      });

      console.timeEnd(`[SFTP] ${filePath}`);

      // Log the raw response for debugging
      console.log('[useFtpFile] Raw response:', response);

      if (response.error) {
        console.error("[useFtpFile] Error from edge function:", response.error);
        
        // Try fallback to standard ftp-get-file function
        console.log("[useFtpFile] Attempting fallback to ftp-get-file");
        
        const fallbackResponse = await supabase.functions.invoke('ftp-get-file', {
          body: {
            siteId: connection.id,
            path: filePath
          }
        });
        
        if (fallbackResponse.error) {
          throw new Error(fallbackResponse.error.message || "Failed to load file (fallback failed)");
        }
        
        const { data: fallbackData } = fallbackResponse;
        
        if (fallbackData && fallbackData.success) {
          // For ftp-get-file, content might be base64 encoded
          let decodedContent = fallbackData.content;
          if (typeof fallbackData.content === 'string' && fallbackData.content.match(/^[A-Za-z0-9+/=]+$/)) {
            try {
              decodedContent = atob(fallbackData.content);
            } catch (e) {
              console.warn("[useFtpFile] Content doesn't appear to be valid base64, using as-is");
            }
          }
          
          setContent(decodedContent || "");
          setError(null);
          return decodedContent || "";
        } else {
          throw new Error(fallbackData?.message || "Failed to load file content");
        }
      }
      
      const { data } = response;
      
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
