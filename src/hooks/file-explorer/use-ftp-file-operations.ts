
import { useState } from "react";
import { toast } from "sonner";
import { listDir, getFile } from "@/lib/ftp";
import { normalizePath } from "@/utils/path";

// Helper function to add delay between retries
const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export function useFtpFileOperations() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDirectory = async (connectionId: string, path: string) => {
    if (!connectionId) {
      console.error("[useFtpFileOperations] Missing connectionId");
      return { files: [], path: path };
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const normalizedPath = normalizePath(path);
      console.log(`[loadDirectory] Original: "${path}" → Normalized: "${normalizedPath}", connectionId: ${connectionId}`);
      
      const result = await listDir(connectionId, normalizedPath);
      console.log("[loadDirectory] Result:", result);
      
      if (result && result.data && result.data.files) {
        // Pass through the exact server-provided file metadata without modification
        console.log(`[loadDirectory] Files received: ${result.data.files.length}`);
        return {
          files: result.data.files,
          path: normalizedPath
        };
      } else {
        console.error("[useFtpFileOperations] Invalid response format:", result);
        throw new Error("Invalid response format from server");
      }
    } catch (error: any) {
      console.error("[useFtpFileOperations] Directory loading error:", error);
      setError(error.message || "Failed to load directory");
      toast.error(`Failed to load directory: ${error.message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

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
        const errorMsg = `Error ${response.status}: ${response.statusText}`;
        console.log('[fetchFileContent] → status: error, bytes: 0, error:', errorMsg);
        setError(errorMsg);
        toast.error(`Error loading file: ${errorMsg}`);
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
          const errorMsg = `Error on retry ${response.status}: ${response.statusText}`;
          console.log('[fetchFileContent] → retry status: error, bytes: 0, error:', errorMsg);
          setError(errorMsg);
          toast.error(`Error loading file on retry: ${errorMsg}`);
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
      setError(null);
      setIsLoading(false);
      return content;
      
    } catch (error: any) {
      console.error("[fetchFileContent] File loading error:", error);
      console.log('[fetchFileContent] → status: exception, bytes: 0, error:', error.message);
      setError(error.message || "Unknown error");
      toast.error(`Error loading file: ${error.message}`);
      setIsLoading(false);
      return Promise.reject(error);
    }
  };

  const refreshDirectoryFromServer = async (connectionId: string, path: string) => {
    if (!connectionId) {
      console.error("[refreshDirectoryFromServer] Missing connectionId");
      return { files: [], path: path };
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const normalizedPath = normalizePath(path);
      console.log(`[refreshDirectoryFromServer] Forcing refresh for path: "${normalizedPath}", connectionId: ${connectionId}`);
      
      const response = await fetch('/api/files/refreshFromServer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionId, path: normalizedPath }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Failed to refresh directory: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.data && result.data.files) {
        toast.success("Files refreshed from server");
        return {
          files: result.data.files,
          path: normalizedPath
        };
      } else {
        throw new Error(result.message || "Failed to refresh directory listing");
      }
    } catch (error: any) {
      console.error("[refreshDirectoryFromServer] Error:", error);
      setError(error.message || "Failed to refresh directory");
      toast.error(`Failed to refresh directory: ${error.message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    loadDirectory,
    fetchFileContent,
    refreshDirectoryFromServer,
    isLoading,
    setIsLoading,
    isSaving,
    error,
    setError
  };
}
