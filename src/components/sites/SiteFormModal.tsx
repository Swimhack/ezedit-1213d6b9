
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { FTPSite } from "@/hooks/use-ftp-sites";

interface SiteFormModalProps {
  isOpen: boolean;
  site: FTPSite | null;
  onClose: () => void;
  onSave: () => void;
}

export function SiteFormModal({
  isOpen,
  site,
  onClose,
  onSave
}: SiteFormModalProps) {
  const [siteName, setSiteName] = useState("");
  const [serverUrl, setServerUrl] = useState("");
  const [port, setPort] = useState("21");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen && site) {
      setSiteName(site.site_name || "");
      setServerUrl(site.server_url || "");
      setPort(site.port?.toString() || "21");
      setUsername(site.username || "");
      setPassword(""); // Don't prefill password for security
      setTestResult(null);
    } else if (isOpen) {
      // Reset form when opening for a new site
      setSiteName("");
      setServerUrl("");
      setPort("21");
      setUsername("");
      setPassword("");
      setTestResult(null);
    }
  }, [isOpen, site]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Validate form
      if (!serverUrl || !username || (!password && !site)) {
        toast.error("Please fill in all required fields");
        setIsLoading(false);
        return;
      }

      // Convert port to number
      const portNumber = parseInt(port, 10);
      if (isNaN(portNumber) || portNumber <= 0 || portNumber > 65535) {
        toast.error("Please enter a valid port number");
        setIsLoading(false);
        return;
      }

      // Get current user ID
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast.error("You must be logged in to save a site");
        setIsLoading(false);
        return;
      }

      // For updates, only include password if provided new one
      const passwordField = password ? { encrypted_password: password } : {};

      // Prepare the data object for upsert
      const upsertData: any = {
        id: site?.id,
        server_url: serverUrl,
        port: portNumber,
        username,
        ...passwordField,
        user_id: session.user.id,
        updated_at: new Date().toISOString()
      };
      
      // Only add site_name if it's not empty
      if (siteName) {
        upsertData.site_name = siteName;
      }

      // Save or update site
      const { error } = await supabase
        .from("ftp_credentials")
        .upsert(upsertData)
        .select().single();

      if (error) {
        console.error("Error saving site:", error);
        toast.error(`Failed to save site: ${error.message}`);
        setIsLoading(false);
        return;
      }

      toast.success(`FTP site ${site ? 'updated' : 'added'} successfully`);
      onSave();
    } catch (error: any) {
      console.error("Error in handleSubmit:", error);
      toast.error(`Failed to save site: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTest = async () => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      // Validate inputs
      if (!serverUrl || !username || (!password && !site)) {
        toast.error("Please fill in all required fields");
        setIsLoading(false);
        return;
      }

      const portNumber = parseInt(port, 10);
      if (isNaN(portNumber) || portNumber <= 0 || portNumber > 65535) {
        toast.error("Please enter a valid port number");
        setIsLoading(false);
        return;
      }

      // Test connection
      const response = await fetch(`https://natjhcqynqziccssnwim.supabase.co/functions/v1/test-ftp-connection`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          server: serverUrl,
          port: portNumber,
          user: username,
          password: password || (site?.encrypted_password || "")
        }),
      });
      
      const result = await response.json();
      
      setTestResult({
        success: result.success || false,
        message: result.message || "Connection test failed"
      });
      
      if (result.success) {
        toast.success("Connection test successful!");
      } else {
        toast.error(`Connection test failed: ${result.message || "Unknown error"}`);
      }
    } catch (error: any) {
      console.error("Error testing connection:", error);
      setTestResult({
        success: false,
        message: error.message || "Connection failed"
      });
      toast.error(`Connection test failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {site ? "Edit FTP Site" : "Add FTP Site"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="site_name">Site Name (Optional)</Label>
            <Input
              id="site_name"
              placeholder="My Website"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
            />
          </div>

          <div className="grid w-full items-center gap-2">
            <Label htmlFor="server_url">Server URL *</Label>
            <Input
              id="server_url"
              placeholder="ftp.example.com"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              required
            />
          </div>

          <div className="grid w-full items-center gap-2">
            <Label htmlFor="port">Port *</Label>
            <Input
              id="port"
              type="number"
              placeholder="21"
              value={port}
              onChange={(e) => setPort(e.target.value)}
              required
            />
          </div>

          <div className="grid w-full items-center gap-2">
            <Label htmlFor="username">Username *</Label>
            <Input
              id="username"
              placeholder="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="grid w-full items-center gap-2">
            <Label htmlFor="password">
              {site ? "Password (leave blank to keep current)" : "Password *"}
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={!site}
            />
          </div>

          {testResult && (
            <div className={`p-3 rounded-md ${
              testResult.success ? 'bg-green-50 text-green-800 border border-green-200' : 
              'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {testResult.message}
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-0">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleTest} 
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Test Connection
            </Button>
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {site ? "Update" : "Save"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
