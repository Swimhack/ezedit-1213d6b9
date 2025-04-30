
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Hook for loading file content from FTP/SFTP connections
 */
export function useFileLoader() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load file content from FTP/SFTP connection
   */
  const loadFile = async (connectionId: string, filePath: string): Promise<string> => {
    if (!connectionId || !filePath) {
      setError("Missing connection ID or file path");
      setIsLoading(false);
      return "";
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`[useFileLoader] Loading file: ${filePath} for connection: ${connectionId}`);
      
      // First try using the SFTP function with cache-busting
      const timestamp = Date.now();
      const response = await supabase.functions.invoke('sftp-file', {
        body: {
          siteId: connectionId,
          path: filePath,
          timestamp: timestamp // Add timestamp for cache busting
        }
      });
      
      console.log('[useFileLoader] SFTP response:', response);
      
      if (response.error) {
        throw new Error(response.error.message || "Failed to load file via SFTP");
      }
      
      if (response.data && response.data.success) {
        const fileContent = response.data.content || "";
        console.log(`[useFileLoader] File loaded successfully via SFTP, size: ${fileContent.length} bytes`);
        console.log("Visual fileContent typeof:", typeof fileContent);
        console.log("Visual fileContent length:", fileContent?.length);
        console.log("Visual preview content:", fileContent?.slice(0, 200));
        setIsLoading(false);
        setError(null);
        return fileContent;
      } else {
        throw new Error(response.data?.message || "Failed to load file content");
      }
    } catch (sftpError: any) {
      console.error("[useFileLoader] SFTP Error:", sftpError);
      
      // Fallback to the FTP get-file function with cache busting
      try {
        console.log('[useFileLoader] Attempting fallback to ftp-get-file');
        const timestamp = Date.now();
        
        const fallbackResponse = await supabase.functions.invoke('ftp-get-file', {
          body: {
            siteId: connectionId,
            path: filePath,
            timestamp: timestamp // Add timestamp for cache busting
          }
        });
        
        console.log('[useFileLoader] FTP fallback response:', fallbackResponse);
        
        if (fallbackResponse.error) {
          throw new Error(fallbackResponse.error.message || "Failed to load file (fallback failed)");
        }
        
        const { data } = fallbackResponse;
        
        if (data && data.success) {
          // For ftp-get-file, content might be base64 encoded
          let decodedContent = data.content;
          if (typeof data.content === 'string' && data.content.match(/^[A-Za-z0-9+/=]+$/)) {
            try {
              decodedContent = atob(data.content);
              console.log('[useFileLoader] Successfully decoded base64 content');
            } catch (e) {
              console.warn("[useFileLoader] Content doesn't appear to be valid base64, using as-is");
            }
          }
          
          console.log(`[useFileLoader] File loaded successfully via FTP fallback, size: ${decodedContent?.length || 0} bytes`);
          console.log("Visual fileContent typeof:", typeof decodedContent);
          console.log("Visual fileContent length:", decodedContent?.length);
          console.log("Visual preview content:", decodedContent?.slice(0, 200));
          setIsLoading(false);
          setError(null);
          return decodedContent || "";
        } else {
          throw new Error(data?.message || "Failed to load file content");
        }
      } catch (ftpError: any) {
        console.error("[useFileLoader] FTP Fallback Error:", ftpError);
        setError(ftpError.message || "Failed to load file after multiple attempts");
        setIsLoading(false);
        return "";
      }
    }
  };

  return {
    isLoading,
    error,
    loadFile,
    setError,
    setIsLoading
  };
}
