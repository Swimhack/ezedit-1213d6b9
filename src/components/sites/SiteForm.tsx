
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { FTPSite } from "@/hooks/use-ftp-sites";

interface SiteFormProps {
  site: FTPSite | null;
  testResult: {
    success: boolean;
    message: string;
  } | null;
}

export function SiteForm({
  site,
  testResult
}: SiteFormProps) {
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

  return (
    <div className="space-y-4 py-4">
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
          name="site_name"
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
            name="server_url"
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
            name="port"
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
            name="username"
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
            name="password"
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
          name="root_directory"
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
    </div>
  );
}

export function getFormData(form: HTMLFormElement) {
  const formData = new FormData(form);
  return {
    siteName: formData.get('site_name') as string || '',
    serverUrl: formData.get('server_url') as string,
    port: parseInt(formData.get('port') as string, 10) || 21,
    username: formData.get('username') as string,
    password: formData.get('password') as string,
    rootDirectory: formData.get('root_directory') as string || '',
  };
}
