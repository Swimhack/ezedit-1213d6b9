
import { useState } from "react";
import { toast } from "sonner";
import { logEvent } from "@/utils/ftp-utils";
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
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

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
    setTestResult(null);
    
    try {
      // Log the request details (without password)
      logEvent(`Testing FTP connection to ${host}:${port} with user ${username}`, 'info', 'ftpTest');
      
      // Use Supabase function instead of direct API call
      const { data, error } = await supabase.functions.invoke("ftp-test-connection", {
        body: { 
          host: host, 
          port: port || 21, 
          username: username, 
          password: password || existingPassword || '' 
        }
      });
      
      // Log the raw result for debugging
      logEvent(`FTP test response: ${JSON.stringify(data || {})}`, 'info', 'ftpTest');
      
      if (error) {
        const errorMessage = error.message || "Unknown error";
        logEvent(`FTP test error: ${errorMessage}`, 'error', 'ftpTest');
        
        // Create and set result
        const newResult = {
          success: false,
          message: errorMessage
        };
        
        setTestResult(newResult);
        toast.error(`Connection failed: ${errorMessage}`);
        return false;
      }
      
      // Create result from data
      const result = data || { success: false, message: "No response data" };
      
      // Update the testResult state
      const newResult = {
        success: !!result.success,
        message: result.message || (result.success ? "Connection successful!" : "Connection failed")
      };
      
      setTestResult(newResult);
      
      // Show appropriate toast based on result
      if (result.success) {
        toast.success("Connection successful!");
        return true;
      } else {
        toast.error(`Connection failed: ${result.message || "Unknown error"}`);
        return false;
      }
    } catch (error: any) {
      const errorMessage = error.message || "Unknown error occurred";
      toast.error(`Error testing connection: ${errorMessage}`);
      logEvent(`FTP test error: ${errorMessage}`, 'error', 'ftpTest');
      
      // Update testResult state with error
      setTestResult({
        success: false,
        message: errorMessage
      });
      
      return false;
    } finally {
      setIsTestingConnection(false);
    }
  };

  return {
    isTestingConnection,
    testConnection,
    testResult
  };
}
