
import { useState } from "react";
import { toast } from "sonner";
import { sleep, createConnectionErrorMessage } from "@/utils/ftp-utils";

export function useFtpFileContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch file content from FTP server
   */
  const fetchFileContent = async (connectionId: string, filePath: string): Promise<string> => {
    if (!connectionId || !filePath) {
      return Promise.resolve("");
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`[fetchFileContent] Loading: ${filePath} from connection: ${connectionId}`);
      console.time(`[FTP] ${filePath}`);
      
      // First attempt to fetch the file
      let response = await fetch(`/api/readFile?path=${encodeURIComponent(connectionId + ":" + filePath)}&t=${Date.now()}`, {
        cache: "no-store",
        headers: { "Pragma": "no-cache", "Cache-Control": "no-cache" },
      });
      
      let content = "";
      
      if (!response.ok) {
        console.warn(`[fetchFileContent] First attempt failed with status ${response.status}, waiting 2 seconds before retry...`);
        await sleep(2000); // 2-second delay before retry
        
        // Second attempt after delay
        console.log(`[fetchFileContent] Retrying: ${filePath} from connection: ${connectionId}`);
        response = await fetch(`/api/readFile?path=${encodeURIComponent(connectionId + ":" + filePath)}&t=${Date.now()}`, {
          cache: "no-store",
          headers: { "Pragma": "no-cache", "Cache-Control": "no-cache" },
        });
      }
      
      if (!response.ok) {
        const errorMsg = createConnectionErrorMessage(`${response.status}: ${response.statusText}`);
        console.log('[fetchFileContent] → status: error, bytes: 0, error:', errorMsg);
        setError(errorMsg);
        toast.error(errorMsg);
        setIsLoading(false);
        return Promise.reject(errorMsg);
      }
      
      content = await response.text();
      
      // If content is empty or invalid, retry after delay
      if (!content || typeof content !== 'string' || content.trim().length === 0) {
        console.warn('[fetchFileContent] Received empty or invalid content, waiting 2 seconds before retry...');
        await sleep(2000); // 2-second delay before retry
        
        // Retry with fresh cache-busting
        console.log(`[fetchFileContent] Retrying content fetch: ${filePath}`);
        response = await fetch(`/api/readFile?path=${encodeURIComponent(connectionId + ":" + filePath)}&t=${Date.now()}`, {
          cache: "no-store",
          headers: { "Pragma": "no-cache", "Cache-Control": "no-cache" },
        });
        
        if (!response.ok) {
          const errorMsg = createConnectionErrorMessage(`${response.status}: ${response.statusText}`);
          console.log('[fetchFileContent] → retry status: error, bytes: 0, error:', errorMsg);
          setError(errorMsg);
          toast.error(errorMsg);
          setIsLoading(false);
          return Promise.reject(errorMsg);
        }
        
        content = await response.text();
        
        if (!content || typeof content !== 'string' || content.trim().length === 0) {
          const errorMsg = "Failed to fetch valid file content after retry";
          console.error('[fetchFileContent]', errorMsg);
          setError(errorMsg);
          toast.error(errorMsg);
          setIsLoading(false);
          return Promise.reject(new Error(errorMsg));
        }
      }
      
      console.timeEnd(`[FTP] ${filePath}`);
      console.log(`[fetchFileContent] → status: success, bytes: ${content.length}`);
      toast.success("✅ Live File Loaded");
      setError(null);
      setIsLoading(false);
      return content;
      
    } catch (error: any) {
      console.error("[fetchFileContent] File loading error:", error);
      console.log('[fetchFileContent] → status: exception, bytes: 0, error:', error.message);
      const errorMsg = createConnectionErrorMessage(error.message);
      setError(errorMsg);
      toast.error(errorMsg);
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
