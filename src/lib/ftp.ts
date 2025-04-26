
import { supabase } from "@/integrations/supabase/client";
import { FileItem } from "@/types/ftp";
import { normalizePath, joinPath } from "@/utils/path";

export interface FtpEntry {
  name: string;
  type: "file" | "directory";
  size?: number;
  modified?: string;
  isDirectory: boolean;
}

/**
 * List the contents of an FTP directory
 */
export async function listDirectory(connection: {
  id: string;
  host: string;
  port: number;
  username: string;
  password: string;
}, path: string = '/') {
  // Normalize the path to ensure it's consistent
  const cleanPath = normalizePath(path);
  
  console.log(`[FTP] Listing directory "${cleanPath}" on ${connection.host} using ID: ${connection.id}`);
  
  try {
    const { data, error } = await supabase.functions.invoke('ftp-list', {
      body: { 
        siteId: connection.id,
        path: cleanPath
      }
    });

    if (error) {
      console.error("[FTP] List error:", error);
      throw error;
    }

    console.log(`[FTP] Raw response:`, data);

    // Check if data.files exists (as expected from the edge function)
    if (!data || !data.files) {
      console.error("[FTP] Unexpected response format:", data);
      return [];
    }

    console.log(`[FTP] Received ${data.files.length} files from server for path "${cleanPath}"`);

    // Map FTP response to react-file-browser schema
    const mappedFiles = (data.files as FileItem[]).map(file => {
      const filePath = joinPath(cleanPath, file.name);
      return {
        key: file.isDirectory ? `${filePath}/` : filePath,
        modified: new Date(file.modified),
        size: file.size,
        isDir: file.isDirectory,
        name: file.name
      };
    });
    
    console.log("[FTP] Mapped files for browser:", mappedFiles);
    return mappedFiles;
  } catch (error: any) {
    console.error("[FTP] Listing failed:", error);
    throw new Error(`Failed to list directory: ${error.message}`);
  }
}

/**
 * Get the content of a file from FTP server
 */
export async function getFile(connection: {
  id: string;
  host: string;
  port: number;
  username: string;
  password: string;
}, filePath: string): Promise<string> {
  try {
    console.log(`[FTP] Getting file "${filePath}" using connection ID: ${connection.id}`);
    
    const { data, error } = await supabase.functions.invoke('ftp-get-file', {
      body: {
        siteId: connection.id,
        path: filePath
      }
    });
    
    if (error) {
      console.error("[FTP] Get file error:", error);
      throw error;
    }
    
    if (!data || !data.success) {
      throw new Error(data?.message || "Unknown error getting file");
    }
    
    // Decode the base64 content
    const decodedContent = atob(data.content);
    return decodedContent;
  } catch (error: any) {
    console.error("[FTP] Get file failed:", error);
    throw new Error(`Failed to get file: ${error.message}`);
  }
}

// Re-export the path utilities so UI uses the same logic
export { joinPath, normalizePath };
