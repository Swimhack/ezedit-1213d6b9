
import { useState } from "react";
import { toast } from "sonner";

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
      const response = await fetch(`/api/test-ftp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          server: host,
          port: port || 21,
          user: username,
          password: password || existingPassword || ''
        }),
      });
      
      if (!response.ok) {
        // Read response body once and store the result
        const errorData = await response.json().catch(() => ({ message: `Server error: ${response.status}` }));
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      // Parse response only once and store the result
      const result = await response.json();
      
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
        toast.error(`Connection failed: ${result.message}`);
        return false;
      }
    } catch (error: any) {
      const errorMessage = error.message || "Unknown error occurred";
      toast.error(`Error testing connection: ${errorMessage}`);
      console.error("FTP test connection error:", error);
      
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
