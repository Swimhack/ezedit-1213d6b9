
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { testFtpConnection } from "@/lib/ftp";
import { toast } from "sonner";

interface FTPConnectionTestProps {
  isLoading: boolean;
  onStartTest: () => void;
  onTestComplete: (result: { success: boolean; message: string }) => void;
}

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
      toast.error("Please fill in all required fields");
      return false;
    }

    if (isNaN(port) || port <= 0 || port > 65535) {
      toast.error("Please enter a valid port number");
      return false;
    }

    // Test connection
    const result = await testFtpConnection(host, port, username, password);
    
    if (result.data?.success) {
      onTestComplete({
        success: true,
        message: "Connection successful!"
      });
      toast.success("Connection test successful!");
      return true;
    } else {
      onTestComplete({
        success: false,
        message: result.data?.message || "Connection failed"
      });
      toast.error(`Connection test failed: ${result.data?.message || "Unknown error"}`);
      return false;
    }
  } catch (error: any) {
    console.error("Error testing connection:", error);
    onTestComplete({
      success: false,
      message: error.message || "Connection failed"
    });
    toast.error(`Connection test failed: ${error.message}`);
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
