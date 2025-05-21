
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { logEvent } from "@/utils/ftp-utils";
import { supabase } from "@/integrations/supabase/client";

interface FTPConnectionTestProps {
  isLoading: boolean;
  onStartTest: () => void;
  onTestComplete?: (result: { success: boolean; message: string }) => void;
}

// Updated to use Supabase function instead of Netlify
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
    
    // Use Supabase function instead of Netlify
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
      return false;
    }
    
    // Process the result
    const result = data || { success: false, message: "No response data" };
    
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
