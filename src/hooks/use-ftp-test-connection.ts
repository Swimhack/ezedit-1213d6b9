
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
        // Handle non-200 responses
        let errorMessage = `Server error: ${response.status}`;
        
        try {
          // Attempt to parse response as JSON
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          // If JSON parsing fails, try to read as text
          try {
            const textError = await response.text();
            if (textError) errorMessage = textError;
          } catch (textError) {
            // If text reading fails too, use default error message
            console.error("Failed to read error response:", textError);
          }
        }
        
        throw new Error(errorMessage);
      }

      // Parse response body with proper error handling
      let result;
      let responseText;
      
      try {
        // First attempt to parse as JSON
        result = await response.json();
      } catch (jsonError) {
        console.warn("Response is not valid JSON, attempting to read as text", jsonError);
        
        try {
          // If JSON parsing fails, try to read as text
          responseText = await response.text();
          console.log("Raw response:", responseText);
          
          // Attempt to extract success/failure info from text
          const isSuccess = responseText.toLowerCase().includes("success") || 
                           responseText.toLowerCase().includes("connected");
          
          result = {
            success: isSuccess,
            message: isSuccess ? 
              "Connection appears successful (non-JSON response)" : 
              "Connection failed (non-JSON response)"
          };
        } catch (textError) {
          console.error("Failed to read response as text:", textError);
          throw new Error("Unable to process server response");
        }
      }
      
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
