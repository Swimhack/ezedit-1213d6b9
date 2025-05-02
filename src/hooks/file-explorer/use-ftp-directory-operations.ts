
import { useState } from "react";
import { toast } from "sonner";
import { listDir } from "@/lib/ftp";
import { normalizePath } from "@/utils/path";
import { safeFormatDate, logEvent } from "@/utils/ftp-utils";

export function useFtpDirectoryOperations() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load directory contents from FTP connection
   */
  const loadDirectory = async (connectionId: string, path: string) => {
    if (!connectionId) {
      const errorMsg = "[useFtpDirectoryOperations] Missing connectionId";
      logEvent(errorMsg, 'error', 'ftpDirectory');
      return { files: [], path: path };
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const normalizedPath = normalizePath(path);
      logEvent(`Loading directory: "${normalizedPath}" for connection: ${connectionId}`, 'info', 'ftpDirectory');
      
      const result = await listDir(connectionId, normalizedPath);
      logEvent(`Directory response received for ${normalizedPath}`, 'log', 'ftpDirectory');
      
      if (result && result.data && result.data.files) {
        // Process file data to ensure valid dates before passing it on
        const processedFiles = result.data.files.map(file => {
          try {
            // Ensure we have valid dates to prevent "Invalid time value" errors
            const safeDate = safeFormatDate(file.modified);
            return {
              ...file,
              modified: safeDate
            };
          } catch (err) {
            logEvent(`Failed to process file date: ${err instanceof Error ? err.message : String(err)}`, 'error', 'ftpDirectory');
            return {
              ...file,
              modified: new Date().toISOString() // Safe fallback
            };
          }
        });
        
        logEvent(`Successfully loaded ${processedFiles.length} files from directory`, 'info', 'ftpDirectory');
        return {
          files: processedFiles,
          path: normalizedPath
        };
      } else {
        const errorMsg = "Invalid response format from server";
        logEvent(errorMsg, 'error', 'ftpDirectory');
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      const errorMsg = error.message || "Failed to load directory";
      logEvent(`Directory loading error: ${errorMsg}`, 'error', 'ftpDirectory');
      setError(errorMsg);
      toast.error(`Failed to load directory: ${errorMsg}`);
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
      const errorMsg = "[refreshDirectoryFromServer] Missing connectionId";
      logEvent(errorMsg, 'error', 'ftpDirectory');
      return { files: [], path: path };
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const normalizedPath = normalizePath(path);
      logEvent(`Forcing refresh for path: "${normalizedPath}", connectionId: ${connectionId}`, 'info', 'ftpDirectory');
      
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
        // Process file data to ensure valid dates before passing it on
        const processedFiles = result.data.files.map(file => {
          try {
            // Ensure we have valid dates
            const safeDate = safeFormatDate(file.modified);
            return {
              ...file,
              modified: safeDate
            };
          } catch (err) {
            logEvent(`Failed to process file date during refresh: ${err instanceof Error ? err.message : String(err)}`, 'error', 'ftpDirectory');
            return {
              ...file,
              modified: new Date().toISOString() // Safe fallback
            };
          }
        });
        
        toast.success("Files refreshed from server");
        logEvent(`Successfully refreshed ${processedFiles.length} files from server`, 'info', 'ftpDirectory');
        return {
          files: processedFiles,
          path: normalizedPath
        };
      } else {
        throw new Error(result.message || "Failed to refresh directory listing");
      }
    } catch (error: any) {
      const errorMsg = error.message || "Failed to refresh directory";
      logEvent(`Refresh directory error: ${errorMsg}`, 'error', 'ftpDirectory');
      setError(errorMsg);
      toast.error(`Failed to refresh directory: ${errorMsg}`);
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
