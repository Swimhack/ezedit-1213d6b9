
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SiteFormProps {
  site: any | null;
  isLoading: boolean;
  testResult: { success: boolean; message: string } | null;
}

export function SiteFormForm({
  site,
  isLoading,
  testResult,
}: SiteFormProps) {
  const [siteName, setSiteName] = useState("");
  const [serverUrl, setServerUrl] = useState("");
  const [port, setPort] = useState("21");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (site) {
      setSiteName(site.site_name || "");
      setServerUrl(site.server_url || "");
      setPort(site.port?.toString() || "21");
      setUsername(site.username || "");
      setPassword(""); // Don't prefill password for security
    } else {
      // Reset form when opening for a new site
      setSiteName("");
      setServerUrl("");
      setPort("21");
      setUsername("");
      setPassword("");
    }
  }, [site]);

  return (
    <form className="space-y-4 py-4">
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
    </form>
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
  };
}
