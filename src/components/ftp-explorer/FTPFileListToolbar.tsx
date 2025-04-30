
import React from "react";
import { Button } from "@/components/ui/button";
import { FolderOpen, File, Upload } from "lucide-react";

interface FTPFileListToolbarProps {
  currentPath: string;
  onCreateFolder: () => void;
  onCreateFile: () => void;
  onUploadFile: () => void;
}

export function FTPFileListToolbar({
  currentPath,
  onCreateFolder,
  onCreateFile,
  onUploadFile
}: FTPFileListToolbarProps) {
  return (
    <div className="flex justify-between items-center mb-4">
      <h4 className="text-md font-semibold text-gray-700">
        Current Path: {currentPath || '/'}
      </h4>
      <div className="space-x-2">
        <Button variant="outline" size="sm" onClick={onCreateFolder}>
          <FolderOpen className="mr-2 h-4 w-4" />
          Create Folder
        </Button>
        <Button variant="outline" size="sm" onClick={onCreateFile}>
          <File className="mr-2 h-4 w-4" />
          New File
        </Button>
        <Button variant="outline" size="sm" onClick={onUploadFile}>
          <Upload className="mr-2 h-4 w-4" />
          Upload File
        </Button>
      </div>
    </div>
  );
}
