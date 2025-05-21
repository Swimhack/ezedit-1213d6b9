
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface FTPConnectionParams {
  host: string;
  port: number;
  username: string;
  password?: string;
  existingPassword?: string;
  directory?: string;
}

export function useFTPTestConnection() {
  const [isTestingConnection, setIsTestingConnection] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<boolean | undefined>(undefined);
  const [lastErrorMessage, setLastErrorMessage] = useState<string | null>(null);

  const testConnection = async (params: FTPConnectionParams): Promise<{ success: boolean; message: string }> => {
    try {
      setIsTestingConnection(true);
      setTestResult(undefined);
      setLastErrorMessage(null);
      
      // Validate required fields
      if (!params.host) {
        throw new Error("Server URL is required");
      }

      if (!params.username) {
        throw new Error("Username is required");
      }

      if (!params.password && !params.existingPassword) {
        throw new Error("Password is required");
      }

      // Use existing password if no new one is provided
      const finalPassword = params.password || params.existingPassword || "";
      
      console.log(`Testing connection to ${params.host}:${params.port}`);
      
      let response;
      try {
        console.log("Using Supabase function for FTP test");
        // First try using Supabase function
        response = await supabase.functions.invoke("ftp-test-connection", {
          body: {
            host: params.host,
            port: params.port,
            username: params.username,
            password: finalPassword,
            directory: params.directory
          },
        });
      } catch (supabaseError) {
        console.error("Supabase function error:", supabaseError);
        // Fall back to Netlify function if Supabase fails
        console.log("Falling back to Netlify function");
        const netlifyResponse = await fetch('/api/test-ftp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            server: params.host,
            port: params.port,
            user: params.username,
            password: finalPassword,
            directory: params.directory
          })
        });
        
        if (!netlifyResponse.ok) {
          throw new Error(`HTTP Error: ${netlifyResponse.status}`);
        }
        
        response = { data: await netlifyResponse.json(), error: null };
      }
      
      if (response.error) {
        console.error("Test connection response error:", response.error);
        toast.error(`Connection failed: ${response.error.message || "Unknown error"}`);
        setTestResult(false);
        setLastErrorMessage(response.error.message || "Unknown error");
        return { success: false, message: response.error.message || "Unknown error" };
      }
      
      const data = response.data;
      
      // Make sure we have a valid response object
      if (!data) {
        const msg = "No response from server";
        toast.error(msg);
        setTestResult(false);
        setLastErrorMessage(msg);
        return { success: false, message: msg };
      }
      
      if (data.success) {
        toast.success("Connection successful!");
        setTestResult(true);
        setLastErrorMessage(null);
        return { success: true, message: "Connection successful!" };
      } else {
        const errorMessage = data.message || "Connection failed";
        toast.error(`Connection failed: ${errorMessage}`);
        setTestResult(false);
        setLastErrorMessage(errorMessage);
        return { success: false, message: errorMessage };
      }
    } catch (error: any) {
      console.error("Error testing connection:", error);
      const errorMessage = error.message || "Unknown error";
      toast.error(`Error testing connection: ${errorMessage}`);
      setTestResult(false);
      setLastErrorMessage(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsTestingConnection(false);
    }
  };

  return {
    testConnection,
    isTestingConnection,
    testResult,
    lastErrorMessage,
  };
}
