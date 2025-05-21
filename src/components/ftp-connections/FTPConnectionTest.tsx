
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { logEvent } from "@/utils/ftp-utils";

interface FTPConnectionTestProps {
  isLoading: boolean;
  onStartTest: () => void;
  onTestComplete?: (result: { success: boolean; message: string }) => void;
}

// This function now includes better error handling for different response formats
export async function testFtpConnectionHandler(
  host: string, 
  port: number, 
  username: string, 
  password: string,
  onTestComplete: (result: { success: boolean; message: string }) => void
) {
  try {
    // Validate inputs
    if (!host || !username || !password) {
      onTestComplete({ success: false, message: "Please fill in all required fields" });
      return false;
    }

    if (isNaN(port) || port <= 0 || port > 65535) {
      onTestComplete({ success: false, message: "Please enter a valid port number" });
      return false;
    }

    logEvent(`Testing FTP connection handler: ${host}:${port}`, 'info', 'ftpHandler');
    
    // Test connection using Netlify function
    const response = await fetch(`/api/test-ftp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        server: host,
        port: port,
        user: username,
        password: password
      }),
    });

    // Check for HTML response by examining content-type
    const contentType = response.headers.get('content-type') || '';
    const responseClone = response.clone();
    
    if (contentType.includes('text/html') || contentType.includes('application/xhtml')) {
      console.warn('Received HTML response instead of JSON');
      
      // Get first part of HTML for debugging
      const htmlContent = await responseClone.text();
      console.log('HTML response preview:', htmlContent.substring(0, 200) + '...');
      
      onTestComplete({ 
        success: false, 
        message: "Server returned HTML instead of JSON. Please try a direct FTP connection."
      });
      return false;
    }
    
    if (!response.ok) {
      let errorMessage = `Server error: ${response.status}`;
      
      try {
        // Try to read as JSON first
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (jsonError) {
        // If JSON parsing fails, try reading as text
        try {
          const textError = await responseClone.text();
          if (textError) errorMessage = textError;
        } catch (textError) {
          console.error("Failed to read error response:", textError);
        }
      }
      
      onTestComplete({ success: false, message: errorMessage });
      return false;
    }

    // Parse response with better error handling
    let result;
    
    try {
      result = await response.json();
    } catch (jsonError) {
      console.warn("Response is not valid JSON:", jsonError);
      
      // Handle non-JSON responses
      try {
        const responseText = await responseClone.text();
        console.log("Raw response text:", responseText);
        
        if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
          onTestComplete({ 
            success: false, 
            message: "Received HTML response instead of JSON. Please check your network connection."
          });
          return false;
        }
        
        // Try to determine success from text content
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
        onTestComplete({ success: false, message: "Unable to process server response" });
        return false;
      }
    }
    
    if (result.success) {
      onTestComplete({
        success: true,
        message: result.message || "Connection successful!"
      });
      return true;
    } else {
      onTestComplete({
        success: false,
        message: result.message || "Connection failed"
      });
      return false;
    }
  } catch (error: any) {
    console.error("Error testing connection:", error);
    onTestComplete({
      success: false,
      message: error.message || "Connection failed"
    });
    return false;
  }
}

export function FTPConnectionTestButton({
  isLoading,
  onStartTest
}: Omit<FTPConnectionTestProps, 'onTestComplete'>) {
  return (
    <Button 
      type="button" 
      variant="outline" 
      onClick={onStartTest} 
      disabled={isLoading}
    >
      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      Test Connection
    </Button>
  );
}
