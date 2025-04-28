
import { Client } from "basic-ftp";
import { supabase } from "@/integrations/supabase/client";

const cache: Record<string, Client> = {};

export async function connectFtp(id: string) {
  if (cache[id]) return cache[id];
  
  const { data, error } = await supabase.functions.invoke("getFtpCreds", { 
    body: { id } 
  });
  
  if (error) {
    throw new Error(`Failed to get FTP credentials: ${error.message}`);
  }
  
  const creds = data as { host: string; port: number; user: string; password: string };
  const client = new Client();
  
  try {
    await client.access({
      host: creds.host,
      port: creds.port,
      user: creds.user,
      password: creds.password,
      secure: false
    });
    
    cache[id] = client;
    return client;
  } catch (error) {
    throw new Error(`FTP connection failed: ${error.message}`);
  }
}

export async function listDir(id: string, path = "/") {
  return supabase.functions.invoke("listDir", { body: { id, path } });
}

export async function getFile(id: string, filepath: string) {
  return supabase.functions.invoke("getFile", { body: { id, filepath } });
}

export async function saveFile({ id, filepath, content, originalChecksum, username }: { 
  id: string; 
  filepath: string; 
  content: string;
  originalChecksum?: string;
  username?: string;
}) {
  return supabase.functions.invoke("saveFile", { 
    body: { id, filepath, content, originalChecksum, username } 
  });
}

export async function uploadFile(id: string, path: string, file: File) {
  const formData = new FormData();
  formData.append("id", id);
  formData.append("path", path);
  formData.append("file", file);
  
  // We need to use fetch directly since FormData is not supported by supabase.functions.invoke
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = import.meta.env;
  
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
  return supabase.functions.invoke("e2eTest", {
    body: { host, port, user, password }
  });
}

// Re-export the path utils
export { normalizePath, joinPath } from "@/utils/path";

// Clear FTP connection cache
export function clearFtpCache(id?: string) {
  if (id) {
    if (cache[id]) {
      cache[id].close();
      delete cache[id];
    }
  } else {
    Object.keys(cache).forEach(key => {
      cache[key].close();
      delete cache[key];
    });
  }
}
