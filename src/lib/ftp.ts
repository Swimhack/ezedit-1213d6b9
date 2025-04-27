
import { supabase } from "@/integrations/supabase/client";
import { FileItem } from "@/types/ftp";
import { normalizePath, joinPath } from "@/utils/path";
import { toast } from "sonner";

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
      
      // Provide more specific error messages based on the error
      let errorMessage = error.message;
      if (error.message.includes("ECONNREFUSED")) {
        errorMessage = "Connection refused. Please check server address and firewall settings.";
      } else if (error.message.includes("530")) {
        errorMessage = "Login incorrect. Please check username and password.";
      } else if (error.message.includes("ENOENT") || error.message.includes("No such")) {
        errorMessage = `Directory "${cleanPath}" not found.`;
      }
      
      toast.error(`Failed to list directory: ${errorMessage}`);
      throw new Error(errorMessage);
    }

    console.log(`[FTP] Raw response:`, data);

    // Check if data.files exists (as expected from the edge function)
    if (!data || !data.files) {
      console.error("[FTP] Unexpected response format:", data);
      toast.error("Received unexpected response format from FTP server");
      throw new Error("Unexpected response format from FTP server");
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
    toast.error(`Failed to list directory: ${error.message}`);
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
      
      // Provide more specific error messages based on the error
      let errorMessage = error.message;
      if (error.message.includes("ECONNREFUSED")) {
        errorMessage = "Connection refused. Please check server address and firewall settings.";
      } else if (error.message.includes("530")) {
        errorMessage = "Login incorrect. Please check username and password.";
      } else if (error.message.includes("ENOENT") || error.message.includes("No such")) {
        errorMessage = `File "${filePath}" not found.`;
      }
      
      toast.error(`Failed to get file: ${errorMessage}`);
      throw new Error(errorMessage);
    }
    
    if (!data || !data.success) {
      const errorMsg = data?.message || data?.error || "Unknown error getting file";
      console.error("[FTP] File download failed:", errorMsg);
      toast.error(`Failed to get file: ${errorMsg}`);
      throw new Error(errorMsg);
    }
    
    // Decode the base64 content
    const decodedContent = atob(data.content);
    return decodedContent;
  } catch (error: any) {
    console.error("[FTP] Get file failed:", error);
    toast.error(`Failed to get file: ${error.message}`);
    throw new Error(`Failed to get file: ${error.message}`);
  }
}

// Re-export the path utilities so UI uses the same logic
export { joinPath, normalizePath };
