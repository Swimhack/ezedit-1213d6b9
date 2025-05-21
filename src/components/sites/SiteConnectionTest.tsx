
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { logEvent } from "@/utils/ftp-utils";
import { supabase } from "@/integrations/supabase/client";

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
): Promise<{ success: boolean; message: string }> {
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

    // Test connection using Supabase function
    const { data, error } = await supabase.functions.invoke("ftp-test-connection", {
      body: {
        host: serverUrl,
        port: port,
        username: username,
        password: finalPassword
      },
    });
    
    if (error) {
      console.error("Test connection response error:", error);
      return {
        success: false,
        message: error.message || "Connection failed"
      };
    }
    
    // Make sure we have a valid response object
    if (!data) {
      return {
        success: false,
        message: "No response from server"
      };
    }
    
    // If we get a specific 530 error, let's provide a more helpful message
    if (data.message && data.message.includes("530 User cannot log in")) {
      return {
        success: false,
        message: "FTP server rejected login credentials (Error 530). Please verify your username and password."
      };
    }
    
    return {
      success: data.success || false,
      message: data.message || "Connection test completed"
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
