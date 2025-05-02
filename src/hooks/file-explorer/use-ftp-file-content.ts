
import { useState } from "react";
import { toast } from "sonner";
import { sleep, createConnectionErrorMessage, logEvent } from "@/utils/ftp-utils";

export function useFtpFileContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch file content from FTP server
   */
  const fetchFileContent = async (connectionId: string, filePath: string): Promise<string> => {
    if (!connectionId || !filePath) {
      const errorMsg = "Missing connectionId or filePath for fetchFileContent";
      logEvent(errorMsg, 'error', 'ftpContent');
      return Promise.resolve("");
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      logEvent(`Loading file: ${filePath} from connection: ${connectionId}`, 'info', 'ftpContent');
      
      // First attempt to fetch the file
      let response = await fetch(`/api/readFile?path=${encodeURIComponent(connectionId + ":" + filePath)}&t=${Date.now()}`, {
        cache: "no-store",
        headers: { "Pragma": "no-cache", "Cache-Control": "no-cache" },
      });
      
      let content = "";
      
      if (!response.ok) {
        logEvent(`First attempt failed with status ${response.status}, retrying...`, 'warn', 'ftpContent');
        await sleep(2000); // 2-second delay before retry
        
        // Second attempt after delay
        logEvent(`Retrying file: ${filePath} from connection: ${connectionId}`, 'info', 'ftpContent');
        response = await fetch(`/api/readFile?path=${encodeURIComponent(connectionId + ":" + filePath)}&t=${Date.now()}`, {
          cache: "no-store",
          headers: { "Pragma": "no-cache", "Cache-Control": "no-cache" },
        });
      }
      
      if (!response.ok) {
        const errorMsg = createConnectionErrorMessage(`${response.status}: ${response.statusText}`);
        logEvent(`File fetch error: ${errorMsg}`, 'error', 'ftpContent');
        setError(errorMsg);
        toast.error(errorMsg);
        setIsLoading(false);
        return Promise.reject(errorMsg);
      }
      
      content = await response.text();
      
      // If content is empty or invalid, retry after delay
      if (!content || typeof content !== 'string' || content.trim().length === 0) {
        logEvent('Received empty or invalid content, retrying...', 'warn', 'ftpContent');
        await sleep(2000); // 2-second delay before retry
        
        // Retry with fresh cache-busting
        logEvent(`Retrying content fetch for: ${filePath}`, 'info', 'ftpContent');
        response = await fetch(`/api/readFile?path=${encodeURIComponent(connectionId + ":" + filePath)}&t=${Date.now()}`, {
          cache: "no-store",
          headers: { "Pragma": "no-cache", "Cache-Control": "no-cache" },
        });
        
        if (!response.ok) {
          const errorMsg = createConnectionErrorMessage(`${response.status}: ${response.statusText}`);
          logEvent(`Retry failed: ${errorMsg}`, 'error', 'ftpContent');
          setError(errorMsg);
          toast.error(errorMsg);
          setIsLoading(false);
          return Promise.reject(errorMsg);
        }
        
        content = await response.text();
        
        if (!content || typeof content !== 'string' || content.trim().length === 0) {
          const errorMsg = "Failed to fetch valid file content after retry";
          logEvent(errorMsg, 'error', 'ftpContent');
          setError(errorMsg);
          toast.error(errorMsg);
          setIsLoading(false);
          return Promise.reject(new Error(errorMsg));
        }
      }
      
      logEvent(`Successfully loaded file: ${filePath}, content length: ${content.length}`, 'info', 'ftpContent');
      toast.success("✅ Live File Loaded");
      setError(null);
      setIsLoading(false);
      return content;
      
    } catch (error: any) {
      const errorMsg = error.message || "Unknown error fetching file";
      logEvent(`Exception during file fetch: ${errorMsg}`, 'error', 'ftpContent');
      setError(createConnectionErrorMessage(error));
      toast.error(createConnectionErrorMessage(error));
      setIsLoading(false);
      return Promise.reject(error);
    }
  };

  return {
    fetchFileContent,
    isLoading,
    setIsLoading,
    isSaving,
    setIsSaving,
    error,
    setError
  };
}
