
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { FTPSite } from "@/hooks/use-ftp-sites";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SiteConnectionTestButton, testSiteConnection } from "./SiteConnectionTest";

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
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  
  // Form state
  const [siteName, setSiteName] = useState(site?.site_name || "");
  const [serverUrl, setServerUrl] = useState(site?.server_url || "");
  const [port, setPort] = useState(site?.port?.toString() || "21");
  const [username, setUsername] = useState(site?.username || "");
  const [password, setPassword] = useState("");
  const [rootDirectory, setRootDirectory] = useState(site?.root_directory || "");
  const [jsonInput, setJsonInput] = useState("");

  // Update form when site changes
  useEffect(() => {
    if (site) {
      setSiteName(site.site_name || "");
      setServerUrl(site.server_url || "");
      setPort(site.port?.toString() || "21");
      setUsername(site.username || "");
      setPassword(""); // Don't prefill password for security
      setRootDirectory(site.root_directory || "");
    } else {
      setSiteName("");
      setServerUrl("");
      setPort("21");
      setUsername("");
      setPassword("");
      setRootDirectory("");
    }
  }, [site]);
  
  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setJsonInput(value);
    
    if (!value.trim()) return;
    
    try {
      const jsonData = JSON.parse(value);
      
      // Map JSON structure to form fields
      if (jsonData.name) {
        setSiteName(jsonData.name);
      }
      
      if (jsonData.ftp) {
        if (jsonData.ftp.host) {
          setServerUrl(jsonData.ftp.host);
        }
        
        if (jsonData.ftp.port) {
          setPort(jsonData.ftp.port.toString());
        }
        
        if (jsonData.ftp.username) {
          setUsername(jsonData.ftp.username);
        }
        
        if (jsonData.ftp.password) {
          setPassword(jsonData.ftp.password);
        }
        
        if (jsonData.ftp.directory) {
          setRootDirectory(jsonData.ftp.directory);
        }
      }
      
      toast.success("JSON data imported successfully");
    } catch (error) {
      // Only show error if there's content but it's invalid JSON
      if (value.trim()) {
        toast.error("Invalid JSON format");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Validate only required fields: serverUrl, username, and password (for new sites)
      const portNumber = parseInt(port, 10);
      
      if (!serverUrl) {
        toast.error("Server URL is required");
        setIsLoading(false);
        return;
      }

      if (!username) {
        toast.error("Username is required");
        setIsLoading(false);
        return;
      }

      // Only validate password for new sites (not editing)
      if (!site && !password) {
        toast.error("Password is required for new sites");
        setIsLoading(false);
        return;
      }

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

      console.log("Saving site with user ID:", session.user.id);

      // For updates, only include password if provided new one
      const passwordField = password ? { encrypted_password: password } : {};

      // Prepare the data object for upsert
      const upsertData: any = {
        ...(site?.id ? { id: site.id } : {}),
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

      // Add root directory if provided
      if (rootDirectory) {
        upsertData.root_directory = rootDirectory;
      }

      // Save or update site to ftp_credentials table
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
      // Use form values directly instead of relying on DOM
      const result = await testSiteConnection(
        serverUrl, 
        parseInt(port, 10), 
        username, 
        password,
        site?.encrypted_password
      );
      
      setTestResult(result);
      
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
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {site ? "Edit FTP Site" : "Add FTP Site"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="json_input">Paste JSON Configuration (Optional)</Label>
            <Textarea
              id="json_input"
              placeholder='{"name": "My Site", "ftp": {"host": "ftp.example.com", "username": "user", "password": "pass", "directory": "/httpdocs"}}'
              value={jsonInput}
              onChange={handleJsonChange}
              className="font-mono text-sm"
              rows={3}
            />
          </div>

          <div className="grid w-full items-center gap-2">
            <Label htmlFor="site_name">Site Name (Optional)</Label>
            <Input
              id="site_name"
              placeholder="My Website"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          </div>

          <div className="grid w-full items-center gap-2">
            <Label htmlFor="root_directory">Root Directory (Optional)</Label>
            <Input
              id="root_directory"
              placeholder="/httpdocs"
              value={rootDirectory}
              onChange={(e) => setRootDirectory(e.target.value)}
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

          <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2 pt-4">
            <SiteConnectionTestButton
              isLoading={isLoading}
              onTestConnection={handleTest}
            />
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
