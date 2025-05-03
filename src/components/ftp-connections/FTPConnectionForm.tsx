
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface FTPConnectionFormProps {
  editingConnection: any | null;
  isLoading: boolean;
  testResult: { success: boolean; message: string } | null;
  onSubmit: (e: React.FormEvent) => void;
}

export function FTPConnectionForm({
  editingConnection,
  isLoading,
  testResult,
  onSubmit,
}: FTPConnectionFormProps) {
  const [serverName, setServerName] = useState("");
  const [host, setHost] = useState("");
  const [port, setPort] = useState("21");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (editingConnection) {
      setServerName(editingConnection.server_name || "");
      setHost(editingConnection.host || "");
      setPort(editingConnection.port?.toString() || "21");
      setUsername(editingConnection.username || "");
      setPassword("");
    } else {
      // Reset form when opening for a new connection
      setServerName("");
      setHost("");
      setPort("21");
      setUsername("");
      setPassword("");
    }
  }, [editingConnection]);

  return (
    <form onSubmit={onSubmit} className="space-y-4 py-4">
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
          value={username}
          onChange={(e) => setUsername(e.target.value)}
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
    </form>
  );
}

// Export form data for use in the parent component
export function getFormData(form: HTMLFormElement): {
  serverName: string;
  host: string;
  port: number;
  username: string;
  password: string;
} {
  const formElements = form.elements as any;
  return {
    serverName: formElements.server_name.value,
    host: formElements.host.value,
    port: parseInt(formElements.port.value, 10) || 21,
    username: formElements.username.value,
    password: formElements.password.value,
  };
}
