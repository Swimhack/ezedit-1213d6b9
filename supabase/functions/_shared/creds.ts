
import { supabase } from "./supabaseClient.ts";

export async function getFtpCreds(siteId) {
  const { data, error } = await supabase
    .from("ftp_connections")
    .select("host, username, password, port")
    .eq("id", siteId)
    .single();

  if (error) {
    console.error("Error fetching FTP credentials:", error);
    return null;
  }

  return {
    host: data.host,
    user: data.username,
    password: data.password,
    port: data.port || 21
  };
}
