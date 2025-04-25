
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FTPCredentials {
  host: string;
  username: string;
  password: string;
  port: number;
}

const FTPConnectionForm = () => {
  const [credentials, setCredentials] = useState<FTPCredentials>({
    host: "",
    username: "",
    password: "",
    port: 21,
  });
  const [isConnecting, setIsConnecting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnecting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please login to use FTP connections");
        return;
      }

      const response = await supabase.functions.invoke('ftp-connect', {
        body: credentials
      });

      if (response.data.success) {
        toast.success("Connected to FTP server successfully");
        // Save credentials if connection was successful
        await supabase.from('ftp_credentials').insert({
          host: credentials.host,
          username: credentials.username,
          password: credentials.password,
          port: credentials.port,
          user_id: session.user.id // Add the user_id field
        });
      } else {
        toast.error(`Connection failed: ${response.data.error}`);
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto p-6 bg-eznavy-light rounded-lg border border-ezgray-dark">
      <h2 className="text-xl font-semibold text-ezwhite mb-4">FTP Connection</h2>
      
      <div>
        <Input
          type="text"
          placeholder="FTP Host"
          value={credentials.host}
          onChange={(e) => setCredentials(prev => ({ ...prev, host: e.target.value }))}
          className="bg-eznavy border-ezgray-dark text-ezwhite"
          required
        />
      </div>

      <div>
        <Input
          type="text"
          placeholder="Username"
          value={credentials.username}
          onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
          className="bg-eznavy border-ezgray-dark text-ezwhite"
          required
        />
      </div>

      <div>
        <Input
          type="password"
          placeholder="Password"
          value={credentials.password}
          onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
          className="bg-eznavy border-ezgray-dark text-ezwhite"
          required
        />
      </div>

      <div>
        <Input
          type="number"
          placeholder="Port (default: 21)"
          value={credentials.port}
          onChange={(e) => setCredentials(prev => ({ ...prev, port: parseInt(e.target.value) }))}
          className="bg-eznavy border-ezgray-dark text-ezwhite"
        />
      </div>

      <Button 
        type="submit" 
        disabled={isConnecting}
        className="w-full bg-ezblue text-eznavy hover:bg-ezblue-light"
      >
        {isConnecting ? "Connecting..." : "Connect to FTP"}
      </Button>
    </form>
  );
};

export default FTPConnectionForm;
