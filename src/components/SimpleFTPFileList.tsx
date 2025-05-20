
import React from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Button } from "@/components/ui/button";
import { FileExplorer } from "@/components/file-explorer/FileExplorer";

interface SimpleFTPFileListProps {
  currentPath: string;
  files: any[];
  onNavigate: (path: string) => void;
  onSelectFile: (file: { key: string; isDir: boolean }) => void;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export function SimpleFTPFileList({
  currentPath,
  files,
  onNavigate,
  onSelectFile,
  isLoading,
  onRefresh,
}: SimpleFTPFileListProps) {
  const [selectedFilePath, setSelectedFilePath] = useLocalStorage<string | null>("selected-file-path", null);

  // Mock connection for demo
  const mockConnection = {
    id: "demo-connection",
    host: "ftp.example.com",
    username: "demo",
    password: "password",
  };

  // Adapter function to convert from our file explorer format to the expected format
  const handleFileSelect = (path: string, isDirectory: boolean) => {
    setSelectedFilePath(path);
    onSelectFile({ key: path, isDir: isDirectory });
  };

  return (
    <div className="h-full">
      <FileExplorer
        connection={mockConnection}
        onSelectFile={handleFileSelect}
        selectedFilePath={selectedFilePath}
      />
    </div>
  );
}
