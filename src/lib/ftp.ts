
import { supabase } from "@/integrations/supabase/client";
import { FileItem } from "@/types/ftp";

export async function listDirectory(connection: {
  host: string;
  port: number;
  username: string;
  password: string;
}, path: string = '/') {
  const cleanPath = path.trim() === '' ? '/' : path;
  
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

    if (error) throw error;

    // Map FTP response to react-file-browser schema
    return (data.files as FileItem[]).map(file => ({
      key: `${cleanPath === '/' ? '' : cleanPath}${file.name}${file.isDirectory ? '/' : ''}`,
      modified: new Date(file.modified),
      size: file.size,
      isDir: file.isDirectory
    }));
  } catch (error: any) {
    throw new Error(`Failed to list directory: ${error.message}`);
  }
}
