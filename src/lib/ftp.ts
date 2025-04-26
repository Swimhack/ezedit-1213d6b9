
import { supabase } from "@/integrations/supabase/client";
import { FileItem } from "@/types/ftp";
import { normalizePath, joinPath } from "@/utils/path";

export async function listDirectory(connection: {
  host: string;
  port: number;
  username: string;
  password: string;
}, path: string = '/') {
  // Normalize the path to ensure it's consistent
  const cleanPath = normalizePath(path);
  
  console.log(`[FTP] Listing directory "${cleanPath}" on ${connection.host}`);
  
  try {
    const { data, error } = await supabase.functions.invoke('ftp-list-directory', {
      body: { 
        host: connection.host,
        port: connection.port,
        username: connection.username,
        password: connection.password,
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
