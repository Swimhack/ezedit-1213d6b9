
import { useState } from "react";
import { toast } from "sonner";

/**
 * Hook for loading file content from FTP/SFTP connections
 */
export function useFileLoader() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load file content from FTP/SFTP connection with cache busting
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
      
      // Use secure fetch with cache busting timestamp
      const timestamp = Date.now();
      const response = await fetch(`/api/readFile?path=${encodeURIComponent(connectionId + ":" + filePath)}&t=${timestamp}`, {
        cache: "no-store",
        headers: { "Pragma": "no-cache", "Cache-Control": "no-cache" },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }
      
      const fileContent = await response.text();
      console.log(`[useFileLoader] File loaded successfully, size: ${fileContent.length} bytes`);
      setIsLoading(false);
      setError(null);
      return fileContent;
    } catch (error: any) {
      console.error("[useFileLoader] Error:", error);
      
      // Retry logic could be implemented here if needed
      
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
