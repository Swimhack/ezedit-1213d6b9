
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
      
      // Use the recommended fetch logic with cache busting
      const timestamp = Date.now();
      const response = await fetch(`/api/readFile?path=${encodeURIComponent(filePath)}&t=${timestamp}`, {
        cache: "no-store",
        headers: { "Pragma": "no-cache", "Cache-Control": "no-cache" },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }
      
      const fileContent = await response.text();
      console.log(`[useFileLoader] File loaded successfully, size: ${fileContent.length} bytes`);
      console.log("Visual fileContent typeof:", typeof fileContent);
      console.log("Visual fileContent length:", fileContent?.length);
      console.log("Visual preview content:", fileContent?.slice(0, 200));
      setIsLoading(false);
      setError(null);
      return fileContent;
    } catch (error: any) {
      console.error("[useFileLoader] Error:", error);
      setError(error.message || "Failed to load file");
      setIsLoading(false);
      return "";
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
