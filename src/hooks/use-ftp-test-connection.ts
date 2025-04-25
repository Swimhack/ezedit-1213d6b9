
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface FTPTestConnectionParams {
  host: string;
  port: number;
  username: string;
  password: string;
  existingPassword?: string;
}

export function useFTPTestConnection() {
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const testConnection = async ({ 
    host, 
    port, 
    username, 
    password, 
    existingPassword 
  }: FTPTestConnectionParams) => {
    if (!host || !username) {
      toast.error("Please fill in host and username fields");
      return false;
    }

    setIsTestingConnection(true);
    try {
      const response = await fetch(`https://natjhcqynqziccssnwim.supabase.co/functions/v1/ftp-test-connection`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          host,
          port: port || 21,
          username,
          password: password || existingPassword || ''
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      if (result.success) {
        toast.success("Connection successful!");
        return true;
      } else {
        toast.error(`Connection failed: ${result.message}`);
        return false;
      }
    } catch (error: any) {
      toast.error(`Error testing connection: ${error.message}`);
      console.error("FTP test connection error:", error);
      return false;
    } finally {
      setIsTestingConnection(false);
    }
  };

  return {
    isTestingConnection,
    testConnection
  };
}
