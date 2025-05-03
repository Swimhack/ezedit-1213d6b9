
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
    // Validate inputs
    if (!serverUrl || !username || (!password && !existingPassword)) {
      toast.error("Please fill in all required fields");
      return { success: false, message: "Missing required fields" };
    }

    if (isNaN(port) || port <= 0 || port > 65535) {
      toast.error("Please enter a valid port number");
      return { success: false, message: "Invalid port number" };
    }

    // Use existing password if no new one is provided
    const finalPassword = password || existingPassword || "";

    // Test connection
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
    
    const result = await response.json();
    
    return {
      success: result.success || false,
      message: result.message || "Connection test failed"
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
