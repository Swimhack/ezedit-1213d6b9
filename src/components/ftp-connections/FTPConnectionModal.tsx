
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { testFtpConnection } from "@/lib/ftp";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { FtpConnection } from "@/hooks/use-ftp-connections";

interface FTPConnectionModalProps {
  isOpen: boolean;
  editingConnection: FtpConnection | null;
  onClose: () => void;
  onSave: () => void;
}

export function FTPConnectionModal({
  isOpen,
  editingConnection,
  onClose,
  onSave
}: FTPConnectionModalProps) {
  const [serverName, setServerName] = useState("");
  const [host, setHost] = useState("");
  const [port, setPort] = useState("21");
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen && editingConnection) {
      setServerName(editingConnection.server_name || "");
      setHost(editingConnection.host || "");
      setPort(editingConnection.port?.toString() || "21");
      setUser(editingConnection.user || "");
      setPassword(editingConnection.password || "");
      setTestResult(null);
    } else if (isOpen) {
      // Reset form when opening for a new connection
      setServerName("");
      setHost("");
      setPort("21");
      setUser("");
      setPassword("");
      setTestResult(null);
    }
  }, [isOpen, editingConnection]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Validate form
      if (!host || !user || !password) {
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
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        toast.error("You must be logged in to save a connection");
        setIsLoading(false);
        return;
      }

      // Save or update connection
      const { data, error } = await supabase
        .from("ftp_connections")
        .upsert({
          id: editingConnection?.id || undefined,
          server_name: serverName,
          host,
          port: portNumber,
          user,
          password,  // Note: In production, this would be encrypted
          user_id: currentUser.id
        })
        .select();

      if (error) {
        console.error("Error saving connection:", error);
        toast.error(`Failed to save connection: ${error.message}`);
        setIsLoading(false);
        return;
      }

      toast.success(`FTP connection ${editingConnection ? 'updated' : 'added'} successfully`);
      onSave();
      onClose();
    } catch (error: any) {
      console.error("Error in handleSubmit:", error);
      toast.error(`Failed to save connection: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTest = async () => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      // Validate inputs
      if (!host || !user || !password) {
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
      const result = await testFtpConnection(host, portNumber, user, password);
      
      if (result.data?.success) {
        setTestResult({
          success: true,
          message: "Connection successful!"
        });
        toast.success("Connection test successful!");
      } else {
        setTestResult({
          success: false,
          message: result.data?.message || "Connection failed"
        });
        toast.error(`Connection test failed: ${result.data?.message || "Unknown error"}`);
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
            {editingConnection ? "Edit FTP Connection" : "Add FTP Connection"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="server_name">Server Name (Optional)</Label>
            <Input
              id="server_name"
              placeholder="My Website"
              value={serverName}
              onChange={(e) => setServerName(e.target.value)}
            />
          </div>

          <div className="grid w-full items-center gap-2">
            <Label htmlFor="host">Host *</Label>
            <Input
              id="host"
              placeholder="ftp.example.com"
              value={host}
              onChange={(e) => setHost(e.target.value)}
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
              value={user}
              onChange={(e) => setUser(e.target.value)}
              required
            />
          </div>

          <div className="grid w-full items-center gap-2">
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {testResult && (
            <div className={`p-3 rounded-md ${testResult.success ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
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
                {editingConnection ? "Update" : "Save"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
