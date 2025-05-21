
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { logEvent } from "@/utils/ftp-utils";
import { supabase } from "@/integrations/supabase/client";

interface FTPConnectionTestProps {
  isLoading: boolean;
  onStartTest: () => void;
  onTestComplete?: (result: { success: boolean; message: string; helpfulMessage?: string }) => void;
}

// Updated to use the consistent error handling approach and include helpfulMessage in return type
export async function testFtpConnectionHandler(
  host: string, 
  port: number, 
  username: string, 
  password: string,
  onTestComplete: (result: { success: boolean; message: string; helpfulMessage?: string }) => void
) {
  try {
    // Validate inputs
    if (!host || !username || !password) {
      onTestComplete({ success: false, message: "Please fill in all required fields" });
      return;
    }

    if (isNaN(port) || port <= 0 || port > 65535) {
      onTestComplete({ success: false, message: "Please enter a valid port number" });
      return;
    }

    logEvent(`Testing FTP connection handler: ${host}:${port}`, 'info', 'ftpHandler');
    
    // Use Supabase function for testing
    const { data, error } = await supabase.functions.invoke("ftp-test-connection", {
      body: {
        host: host,
        port: port,
        username: username,
        password: password
      },
    });
    
    if (error) {
      const errorMessage = error.message || "Unknown error";
      logEvent(`FTP test error: ${errorMessage}`, 'error', 'ftpHandler');
      
      onTestComplete({
        success: false,
        message: errorMessage
      });
      return;
    }
    
    // Process the result
    if (!data) {
      onTestComplete({
        success: false,
        message: "No response data"
      });
      return;
    }
    
    if (data.success) {
      onTestComplete({
        success: true,
        message: data.message || "Connection successful!"
      });
    } else {
      // Handle specific 530 authentication errors
      if (data.message && data.message.includes("530")) {
        const helpfulMessage = data.helpfulMessage || 
          "Login failed. Please double-check your FTP username and password. If the credentials are correct, your host may require a special connection method.";
        
        onTestComplete({
          success: false,
          message: data.message || "Login authentication failed",
          helpfulMessage: helpfulMessage
        });
      } else {
        onTestComplete({
          success: false,
          message: data.message || "Connection failed",
          helpfulMessage: data.helpfulMessage
        });
      }
    }
  } catch (error: any) {
    console.error("Error testing connection:", error);
    onTestComplete({
      success: false,
      message: error.message || "Connection failed"
    });
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
