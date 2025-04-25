
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface FTPConnectionData {
  server_name: string;
  host: string;
  port: number;
  username: string;
  password: string;
  root_directory?: string;
  web_url?: string;
}

const FTPSettingsModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FTPConnectionData>({
    server_name: "",
    host: "",
    port: 21,
    username: "",
    password: "",
    root_directory: "",
    web_url: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'port' ? parseInt(value) || 21 : value
    }));
  };

  const testConnection = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke('ftp-test-connection', {
        body: formData
      });

      if (error) throw error;
      toast.success("FTP connection successful!");
    } catch (error: any) {
      toast.error(`Connection failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please log in to save FTP settings");
        return;
      }

      const { error } = await supabase.from('ftp_connections').insert({
        ...formData,
        user_id: session.user.id
      });

      if (error) throw error;

      toast.success("FTP settings saved successfully!");
      setIsOpen(false);
    } catch (error: any) {
      toast.error(`Error saving settings: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Add FTP Connection</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>FTP Connection Settings</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="server_name">Server Name</Label>
            <Input
              id="server_name"
              name="server_name"
              placeholder="My Server"
              value={formData.server_name}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="host">FTP Host</Label>
            <Input
              id="host"
              name="host"
              placeholder="ftp.example.com"
              value={formData.host}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="port">Port</Label>
            <Input
              id="port"
              name="port"
              type="number"
              placeholder="21"
              value={formData.port}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="root_directory">Root Directory (Optional)</Label>
            <Input
              id="root_directory"
              name="root_directory"
              placeholder="/public_html"
              value={formData.root_directory}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="web_url">Web URL (Optional)</Label>
            <Input
              id="web_url"
              name="web_url"
              placeholder="https://example.com"
              value={formData.web_url}
              onChange={handleInputChange}
            />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={testConnection}
              disabled={isLoading}
            >
              Test Connection
            </Button>
            <Button type="submit" disabled={isLoading}>
              Save Settings
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FTPSettingsModal;
