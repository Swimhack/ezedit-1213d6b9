
import { useState } from "react";
import { toast } from "sonner";

/**
 * Hook for securely loading file content from FTP/SFTP connections
 */
export function useFileLoader() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Helper to wait a bit (for retry delays)
   */
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  /**
   * Load file content from FTP/SFTP connection with direct connection details
   */
  const loadFileWithSiteDetails = async (site: {
    host: string;
    user: string;
    password: string;
    port?: number;
    secure?: boolean;
  }, filePath: string): Promise<string> => {
    if (!site.host || !site.user || !site.password || !filePath) {
      const msg = "Missing connection details or file path";
      setError(msg);
      toast.error(msg);
      return "";
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log(`[useFileLoader] Loading file: ${filePath} with direct connection to ${site.host}`);

      const response = await fetch(`/api/readFile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify({
          site: {
            host: site.host,
            user: site.user,
            password: site.password,
            port: site.port || 21,
            secure: site.secure || false
          },
          path: filePath
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error ${response.status}: ${errorText}`);
      }

      const fileContent = await response.text();

      if (!fileContent || fileContent.trim().length === 0) {
        throw new Error("Empty file content received");
      }

      console.log(`[useFileLoader] File loaded successfully with direct connection, size: ${fileContent.length} bytes`);
      setError(null);
      setIsLoading(false);
      return fileContent;

    } catch (error: any) {
      console.error("[useFileLoader] Direct connection error:", error);
      const errorMessage = error.message || "Failed to load file";
      setError(errorMessage);
      toast.error(errorMessage);
      setIsLoading(false);
      return "";
    }
  };

  /**
   * Load file content from FTP/SFTP connection with cache busting and graceful retry
   */
  const loadFile = async (connectionId: string, filePath: string): Promise<string> => {
    if (!connectionId || !filePath) {
      const msg = "Missing connection ID or file path";
      setError(msg);
      toast.error(msg);
      return "";
    }

    setIsLoading(true);
    setError(null);

    const timestamp = Date.now();
    const url = `/api/readFile?path=${encodeURIComponent(connectionId + ":" + filePath)}&t=${timestamp}`;

    const attemptLoad = async (): Promise<string> => {
      try {
        console.log(`[useFileLoader] Loading file: ${filePath} for connection: ${connectionId}`);

        const response = await fetch(url, {
          method: "GET",
          cache: "no-store",
          headers: {
            "Pragma": "no-cache",
            "Cache-Control": "no-cache",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
        }

        const fileContent = await response.text();

        if (!fileContent || fileContent.trim().length === 0) {
          throw new Error("Empty file content received");
        }

        console.log(`[useFileLoader] File loaded successfully, size: ${fileContent.length} bytes`);
        return fileContent;

      } catch (error: any) {
        console.error("[useFileLoader] Error:", error);
        throw error;
      }
    };

    try {
      // First attempt
      let fileContent = await attemptLoad();

      // If empty or suspiciously short, retry after short delay
      if (!fileContent || fileContent.trim().length === 0) {
        console.warn("[useFileLoader] First attempt failed, retrying in 2 seconds...");
        await sleep(2000);
        fileContent = await attemptLoad();
      }

      setIsLoading(false);
      setError(null);
      return fileContent;

    } catch (error: any) {
      console.error("[useFileLoader] Final failure after retry:", error);
      const errorMessage = error.message || "Failed to load file";
      setError(errorMessage);
      toast.error(errorMessage);
      setIsLoading(false);
      return "";
    }
  };

  return {
    isLoading,
    error,
    loadFile,
    loadFileWithSiteDetails,
    setError,
    setIsLoading
  };
}
