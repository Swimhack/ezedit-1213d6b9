
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface FTPConnectionTestProps {
  isLoading: boolean;
  onStartTest: () => void;
  onTestComplete?: (result: { success: boolean; message: string }) => void;
}

// This function is simplified to not handle the actual API call directly
// The API call is handled by the useFTPTestConnection hook
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

    if (!response.ok) {
      // Read response body once (not multiple times)
      const errorData = await response.json().catch(() => ({ message: `Server error: ${response.status}` }));
      throw new Error(errorData.message || `Server error: ${response.status}`);
    }

    // Parse response only once
    const result = await response.json();
    
    if (result.success) {
      onTestComplete({
        success: true,
        message: "Connection successful!"
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
