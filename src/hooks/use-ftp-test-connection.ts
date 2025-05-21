
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
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | undefined>(undefined);
  const [lastErrorMessage, setLastErrorMessage] = useState<string | null>(null);
  const [helpfulMessage, setHelpfulMessage] = useState<string | null>(null);

  const testConnection = async (params: FTPConnectionParams): Promise<{ success: boolean; message: string }> => {
    try {
      setIsTestingConnection(true);
      setTestResult(undefined);
      setLastErrorMessage(null);
      setHelpfulMessage(null);
      
      // Validate required fields
      if (!params.host) {
        const message = "Server URL is required";
        toast.error(message);
        setTestResult({ success: false, message });
        setLastErrorMessage(message);
        return { success: false, message };
      }

      if (!params.username) {
        const message = "Username is required";
        toast.error(message);
        setTestResult({ success: false, message });
        setLastErrorMessage(message);
        return { success: false, message };
      }

      if (!params.password && !params.existingPassword) {
        const message = "Password is required";
        toast.error(message);
        setTestResult({ success: false, message });
        setLastErrorMessage(message);
        return { success: false, message };
      }

      // Use existing password if no new one is provided
      const finalPassword = params.password || params.existingPassword || "";
      
      console.log(`Testing connection to ${params.host}:${params.port} as ${params.username}`);
      
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
          const message = `HTTP Error: ${netlifyResponse.status}`;
          toast.error(message);
          setTestResult({ success: false, message });
          setLastErrorMessage(message);
          return { success: false, message };
        }
        
        response = { data: await netlifyResponse.json(), error: null };
      }
      
      if (response.error) {
        console.error("Test connection response error:", response.error);
        const message = response.error.message || "Unknown error";
        toast.error(`Connection failed: ${message}`);
        setTestResult({ success: false, message });
        setLastErrorMessage(message);
        return { success: false, message };
      }
      
      const data = response.data;
      
      // Make sure we have a valid response object
      if (!data) {
        const message = "No response from server";
        toast.error(message);
        setTestResult({ success: false, message });
        setLastErrorMessage(message);
        return { success: false, message };
      }
      
      if (data.success) {
        const message = data.message || "Connection successful!";
        toast.success(message);
        setTestResult({ success: true, message });
        setLastErrorMessage(null);
        setHelpfulMessage(null);
        return { success: true, message };
      } else {
        const errorMessage = data.message || "Connection failed";
        
        // Check if there's a helpful message
        if (data.helpfulMessage) {
          setHelpfulMessage(data.helpfulMessage);
          toast.error(data.helpfulMessage);
        } else {
          toast.error(`Connection failed: ${errorMessage}`);
        }
        
        setTestResult({ success: false, message: errorMessage });
        setLastErrorMessage(errorMessage);
        return { success: false, message: errorMessage };
      }
    } catch (error: any) {
      console.error("Error testing connection:", error);
      const errorMessage = error.message || "Unknown error";
      toast.error(`Error testing connection: ${errorMessage}`);
      setTestResult({ success: false, message: errorMessage });
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
    helpfulMessage,
  };
}
