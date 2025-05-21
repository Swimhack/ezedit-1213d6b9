
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { logEvent } from "@/utils/ftp-utils";

interface SiteConnectionTestProps {
  isLoading: boolean;
  onTestConnection: () => void;
}

export async function testSiteConnection(
  serverUrl: string,
  port: number,
  username: string,
  password: string,
  existingPassword?: string
) {
  try {
    // Validate only required fields: serverUrl, username, and password (or existingPassword)
    if (!serverUrl) {
      return { success: false, message: "Server URL is required" };
    }

    if (!username) {
      return { success: false, message: "Username is required" };
    }

    if (!password && !existingPassword) {
      return { success: false, message: "Password is required" };
    }

    if (isNaN(port) || port <= 0 || port > 65535) {
      return { success: false, message: "Invalid port number" };
    }

    // Use existing password if no new one is provided
    const finalPassword = password || existingPassword || "";
    
    logEvent(`Testing site connection to ${serverUrl}:${port}`, 'info', 'siteTest');

    // Test connection using the Netlify function
    const response = await fetch(`/api/test-ftp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        server: serverUrl,
        port: port,
        user: username,
        password: finalPassword
      }),
    });
    
    // Check content type for HTML detection
    const contentType = response.headers.get('content-type') || '';
    const responseClone = response.clone();
    
    // If content looks like HTML, handle it specially
    if (contentType.includes('text/html') || contentType.includes('application/xhtml')) {
      logEvent('Received HTML response instead of JSON from site test', 'warn', 'siteTest');
      
      // Read HTML content for debugging
      const htmlContent = await responseClone.text();
      console.warn('HTML response in site test:', htmlContent.substring(0, 200) + '...');
      
      return {
        success: false,
        message: "Server returned HTML instead of JSON. Check API configuration or try direct FTP."
      };
    }
    
    // Try to parse the response as JSON with error handling
    let responseData;
    
    try {
      responseData = await response.json();
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError);
      
      // If JSON parsing fails, try to get response as text
      try {
        const textContent = await responseClone.text();
        
        // Check if it looks like HTML
        if (textContent.trim().startsWith('<!DOCTYPE') || textContent.trim().startsWith('<html')) {
          return {
            success: false,
            message: "Received HTML response instead of JSON. The API endpoint may be misconfigured."
          };
        }
        
        logEvent(`Non-JSON response: ${textContent.substring(0, 100)}...`, 'warn', 'siteTest');
        
        return {
          success: false,
          message: "Error parsing server response"
        };
      } catch (textError) {
        console.error("Error reading response as text:", textError);
        return {
          success: false,
          message: "Unable to process server response"
        };
      }
    }
    
    if (!response.ok) {
      console.error("Test connection response error:", response.status, responseData);
      return {
        success: false,
        message: responseData?.message || `Server error (${response.status})`
      };
    }
    
    return {
      success: responseData?.success || false,
      message: responseData?.message || "Connection test completed"
    };
    
  } catch (error: any) {
    console.error("Error testing connection:", error);
    return {
      success: false,
      message: error.message || "Connection failed"
    };
  }
}

export function SiteConnectionTestButton({
  isLoading,
  onTestConnection
}: SiteConnectionTestProps) {
  return (
    <Button 
      type="button" 
      variant="outline" 
      onClick={onTestConnection} 
      disabled={isLoading}
    >
      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      Test Connection
    </Button>
  );
}
