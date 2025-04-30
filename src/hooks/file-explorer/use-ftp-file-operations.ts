
import { useState } from "react";
import { toast } from "sonner";
import { listDir, getFile } from "@/lib/ftp";
import { normalizePath } from "@/utils/path";

export function useFtpFileOperations() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDirectory = async (connectionId: string, path: string) => {
    if (!connectionId) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const normalizedPath = normalizePath(path);
      console.log(`[loadDirectory] Original: "${path}" → Normalized: "${normalizedPath}"`);
      
      const result = await listDir(connectionId, normalizedPath);
      
      if (result && result.data && result.data.files) {
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
      
      const { data, error: supabaseError } = await getFile(connectionId, filePath);

      console.timeEnd(`[FTP] ${filePath}`);

      if (supabaseError) {
        const errorMsg = supabaseError.message || "Unknown error";
        console.log('→ status: error, bytes: 0, error:', errorMsg);
        setError(errorMsg);
        toast.error(`Error loading file: ${errorMsg}`);
        return Promise.reject(errorMsg);
      }
      
      if (data && data.content) {
        const content = data.content || "";
        console.log(`→ status: success, bytes: ${content.length}`);
        setError(null);
        return content;
      } else {
        const errorMsg = data?.message || data?.error || 'Unknown error';
        console.log('→ status: error, bytes: 0, error:', errorMsg);
        setError(errorMsg);
        toast.error(`Failed to load file: ${errorMsg}`);
        return Promise.reject(errorMsg);
      }
    } catch (error: any) {
      console.error("[useFtpFileOperations] File loading error:", error);
      console.log('→ status: exception, bytes: 0, error:', error.message);
      setError(error.message || "Unknown error");
      toast.error(`Error loading file: ${error.message}`);
      return Promise.reject(error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    loadDirectory,
    fetchFileContent,
    isLoading,
    setIsLoading,
    isSaving,
    error,
    setError
  };
}
