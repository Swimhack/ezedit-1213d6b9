
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

    // Test connection with improved error handling
    const response = await fetch(`https://natjhcqynqziccssnwim.supabase.co/functions/v1/test-ftp-connection`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
      },
      body: JSON.stringify({
        server: serverUrl,
        port: port,
        user: username,
        password: finalPassword
      }),
    });
    
    // Parse response as JSON with error handling
    let result;
    try {
      result = await response.json();
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError);
      return {
        success: false,
        message: `Error parsing server response: ${await response.text()}`
      };
    }
    
    if (!response.ok) {
      console.error("Test connection response error:", response.status, result);
      return {
        success: false,
        message: result.message || `Server error (${response.status})`
      };
    }
    
    return {
      success: result.success || false,
      message: result.message || "Connection test completed"
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
