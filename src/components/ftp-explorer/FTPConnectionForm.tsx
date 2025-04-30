
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface FTPConnectionFormProps {
  ftpHost: string;
  ftpPort: number;
  ftpUser: string;
  ftpPassword: string;
  isConnecting: boolean;
  onHostChange: (value: string) => void;
  onPortChange: (value: number) => void;
  onUserChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConnect: () => void;
}

export function FTPConnectionForm({
  ftpHost,
  ftpPort,
  ftpUser, 
  ftpPassword,
  isConnecting,
  onHostChange,
  onPortChange,
  onUserChange,
  onPasswordChange,
  onConnect
}: FTPConnectionFormProps) {
  return (
    <div className="shadow sm:overflow-hidden sm:rounded-md">
      <div className="bg-white px-4 py-5 sm:p-6">
        <div className="grid grid-cols-6 gap-6">
          <div className="col-span-6 sm:col-span-3">
            <Label htmlFor="ftp-host">FTP Host</Label>
            <Input
              type="text"
              name="ftp-host"
              id="ftp-host"
              value={ftpHost}
              onChange={(e) => onHostChange(e.target.value)}
              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>

          <div className="col-span-6 sm:col-span-3">
            <Label htmlFor="ftp-port">FTP Port</Label>
            <Input
              type="number"
              name="ftp-port"
              id="ftp-port"
              value={ftpPort}
              onChange={(e) => onPortChange(parseInt(e.target.value, 10))}
              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>

          <div className="col-span-6 sm:col-span-3">
            <Label htmlFor="ftp-user">FTP User</Label>
            <Input
              type="text"
              name="ftp-user"
              id="ftp-user"
              value={ftpUser}
              onChange={(e) => onUserChange(e.target.value)}
              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>

          <div className="col-span-6 sm:col-span-3">
            <Label htmlFor="ftp-password">FTP Password</Label>
            <Input
              type="password"
              name="ftp-password"
              id="ftp-password"
              value={ftpPassword}
              onChange={(e) => onPasswordChange(e.target.value)}
              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={onConnect} disabled={isConnecting}>
            {isConnecting ? "Connecting..." : "Connect"}
          </Button>
        </div>
      </div>
    </div>
  );
}
