
import { useState } from "react";
import { toast } from "sonner";
import { logEvent } from "@/utils/ftp-utils";

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
      
      // First check if response is OK
      if (!response.ok) {
        const errorMessage = `Server error: ${response.status} ${response.statusText}`;
        logEvent(errorMessage, 'error', 'ftpTest');
        throw new Error(errorMessage);
      }

      // Get the content type to detect if it's HTML instead of JSON
      const contentType = response.headers.get('content-type') || '';
      
      // Clone response for different processing paths
      const responseClone = response.clone();
      
      // If content looks like HTML, handle it specially
      if (contentType.includes('text/html') || contentType.includes('application/xhtml')) {
        logEvent('Received HTML response instead of JSON', 'warn', 'ftpTest');
        
        // Read the HTML content for logging purposes
        const htmlContent = await responseClone.text();
        console.warn('HTML response received:', htmlContent.substring(0, 200) + '...');
        
        // Since we expected JSON but got HTML, this is likely an error
        const newResult = {
          success: false,
          message: "Server returned HTML instead of JSON. Please check server configuration."
        };
        
        setTestResult(newResult);
        toast.error(newResult.message);
        return false;
      }

      // Try to parse as JSON
      let result;
      try {
        // Attempt to parse JSON
        result = await response.json();
        
        // Log the raw result for debugging
        logEvent(`FTP test response: ${JSON.stringify(result)}`, 'info', 'ftpTest');
      } catch (jsonError) {
        // If JSON parsing fails, try to get content as text for better error reporting
        const textContent = await responseClone.text();
        console.error("Failed to parse response as JSON:", jsonError);
        console.log("Raw response content:", textContent.substring(0, 500));
        
        // If it looks like HTML (starts with <!DOCTYPE or <html)
        if (textContent.trim().startsWith('<!DOCTYPE') || textContent.trim().startsWith('<html')) {
          logEvent('Received HTML when expecting JSON', 'warn', 'ftpTest');
          
          // Create a fallback result
          result = {
            success: false,
            message: "Received HTML response instead of JSON. The server may be misconfigured."
          };
        } else {
          // For any other non-JSON response
          result = {
            success: false,
            message: `Unable to parse server response: ${jsonError.message || "Unknown error"}`
          };
        }
      }
      
      // Update the testResult state with our best attempt at a result
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
