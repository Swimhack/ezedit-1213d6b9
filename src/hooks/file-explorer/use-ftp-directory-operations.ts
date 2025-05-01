
import { useState } from "react";
import { toast } from "sonner";
import { listDir } from "@/lib/ftp";
import { normalizePath } from "@/utils/path";

export function useFtpDirectoryOperations() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load directory contents from FTP connection
   */
  const loadDirectory = async (connectionId: string, path: string) => {
    if (!connectionId) {
      console.error("[useFtpDirectoryOperations] Missing connectionId");
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
        console.error("[useFtpDirectoryOperations] Invalid response format:", result);
        throw new Error("Invalid response format from server");
      }
    } catch (error: any) {
      console.error("[useFtpDirectoryOperations] Directory loading error:", error);
      setError(error.message || "Failed to load directory");
      toast.error(`Failed to load directory: ${error.message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Refresh directory listing directly from the server, bypassing cache
   */
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
    refreshDirectoryFromServer,
    isLoading,
    error,
    setError
  };
}
