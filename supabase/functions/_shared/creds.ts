
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

export interface FtpCredentials {
  host: string;
  user: string;
  password: string;
  port: number;
  secure?: boolean;
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Get FTP credentials from the database
 */
export async function getFtpCreds(siteId: string): Promise<FtpCredentials | null> {
  try {
    if (!siteId) {
      console.error("[getFtpCreds] No siteId provided");
      return null;
    }

    console.log(`[getFtpCreds] Fetching credentials for siteId: ${siteId}`);
    
    // Attempt to query the database
    const { data, error } = await supabase
      .from('ftp_connections')
      .select('host, username, password, port')
      .eq('id', siteId)
      .single();

    if (error) {
      console.error("[getFtpCreds] Database error:", error);
      return null;
    }

    if (!data) {
      console.error("[getFtpCreds] No data returned for siteId:", siteId);
      return null;
    }

    console.log(`[getFtpCreds] Successfully retrieved credentials for host: ${data.host}`);
    
    // Return credentials in the expected format
    return {
      host: data.host,
      user: data.username,
      password: data.password,
      port: data.port || 21,
      secure: false
    };
  } catch (error) {
    console.error("[getFtpCreds] Error retrieving credentials:", error);
    return null;
  }
}
