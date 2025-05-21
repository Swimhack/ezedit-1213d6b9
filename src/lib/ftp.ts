
import { supabase } from "@/integrations/supabase/client";
import { normalizePath, joinPath } from "@/utils/path";

export async function listDir(id: string, path = "/") {
  console.log(`[ftp.listDir] Listing directory for connection ${id}, path: ${path}`);
  
  try {
    const { data, error } = await supabase.functions.invoke("ftp-list", { 
      body: { siteId: id, path } 
    });
    
    if (error) {
      console.error(`[ftp.listDir] Error:`, error);
      throw new Error(error.message);
    }
    
    console.log(`[ftp.listDir] Success, received ${data?.files?.length || 0} files`);
    return { data };
  } catch (err: any) {
    console.error(`[ftp.listDir] Exception:`, err);
    throw err;
  }
}

export async function getFile(id: string, filepath: string) {
  console.log(`[ftp.getFile] Getting file ${filepath} for connection ${id}`);
  return supabase.functions.invoke("ftp-get-file", { body: { id, filepath } });
}

export async function saveFile({ id, filepath, content, originalChecksum, username }: { 
  id: string; 
  filepath: string; 
  content: string;
  originalChecksum?: string;
  username?: string;
}) {
  try {
    console.log(`[ftp.saveFile] Saving file: ${filepath}, content length: ${content.length}`);
    
    const response = await fetch(`/api/saveFile`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
      },
      body: JSON.stringify({ id, filepath, content, originalChecksum, username }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to save: ${response.status} ${errorText}`);
    }
    
    return { data: await response.json(), error: null };
  } catch (error: any) {
    console.error("[ftp.saveFile] Error:", error);
    return { data: null, error: { message: error.message } };
  }
}

export async function uploadFile(id: string, path: string, file: File) {
  const formData = new FormData();
  formData.append("id", id);
  formData.append("path", path);
  formData.append("file", file);
  
  // We need to use fetch directly since FormData is not supported by supabase.functions.invoke
  const response = await fetch(`https://natjhcqynqziccssnwim.supabase.co/functions/v1/uploadFile`, {
    method: "POST",
    body: formData,
    headers: {
      "Authorization": `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
    }
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to upload file: ${error}`);
  }
  
  return response.json();
}

export async function renameFile({ id, oldPath, newPath, username }: {
  id: string;
  oldPath: string;
  newPath: string;
  username?: string;
}) {
  return supabase.functions.invoke("renameFile", {
    body: { id, oldPath, newPath, username }
  });
}

export async function deleteFile(id: string, filepath: string, username?: string) {
  return supabase.functions.invoke("deleteFile", {
    body: { id, filepath, username }
  });
}

export async function lockFile(id: string, filepath: string, username: string, minutes = 15) {
  return supabase.functions.invoke("lockFile", {
    body: { id, filepath, username, minutes }
  });
}

export async function getStats(id: string) {
  return supabase.functions.invoke("getStats", { body: { id } });
}

export async function testFtpConnection(host: string, port: number, user: string, password: string) {
  return supabase.functions.invoke("test-ftp-connection", {
    body: { server: host, port, user, password }
  });
}

export async function refreshFilesFromServer(id: string, path = "/") {
  console.log(`[ftp.refreshFilesFromServer] Refreshing files for connection ${id}, path: ${path}`);
  
  try {
    const response = await fetch('/api/files/refreshFromServer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ connectionId: id, path }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Failed to refresh files: ${response.status}`);
    }
    
    return await response.json();
  } catch (err: any) {
    console.error(`[ftp.refreshFilesFromServer] Exception:`, err);
    throw err;
  }
}

// Re-export the path utils
export { normalizePath, joinPath } from "@/utils/path";

// Clear FTP connection cache (now moved entirely to the server side)
export function clearFtpCache() {
  console.log("FTP cache clearing is handled on the server side");
}
