
import { useState } from "react";
import { format } from "date-fns";
import { ChevronRight, FolderIcon, FileIcon } from "lucide-react";
import { toast } from "sonner";
import { formatFileSize } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface FTPFileListProps {
  currentPath: string;
  files: any[];
  onNavigate: (newPath: string) => void;
  onSelectFile?: (file: { key: string; isDir: boolean }) => void;
  isLoading: boolean;
}

export function FTPFileList({ 
  currentPath, 
  files, 
  onNavigate, 
  onSelectFile,
  isLoading 
}: FTPFileListProps) {
  const pathParts = currentPath.split('/').filter(Boolean);

  const handlePathClick = (index: number) => {
    const newPath = '/' + pathParts.slice(0, index + 1).join('/') + '/';
    onNavigate(newPath);
  };

  const handleFileClick = (file: any) => {
    if (file.isDirectory || file.type === "directory") {
      const newPath = currentPath.endsWith('/') 
        ? `${currentPath}${file.name}/`
        : `${currentPath}/${file.name}/`;
      onNavigate(newPath);
    } else if (onSelectFile) {
      const filePath = currentPath.endsWith('/')
        ? `${currentPath}${file.name}`
        : `${currentPath}/${file.name}`;
      onSelectFile({ key: filePath, isDir: false });
    }
  };

  const formatDate = (dateValue: any) => {
    try {
      if (!dateValue) return "Unknown date";
      
      // Handle different date formats that might come from the server
      if (dateValue instanceof Date) {
        if (isNaN(dateValue.getTime())) {
          return "Unknown date";
        }
        return format(dateValue, "MMM d, yyyy HH:mm");
      }
      
      // If it's a string that can be parsed as a date
      if (typeof dateValue === 'string') {
        // Prevent invalid date strings from being parsed
        if (!dateValue.trim()) return "Unknown date";
        
        const date = new Date(dateValue);
        if (!isNaN(date.getTime())) {
          return format(date, "MMM d, yyyy HH:mm");
        }
        return "Unknown date";
      }
      
      // If it's a number (timestamp)
      if (typeof dateValue === 'number') {
        if (isNaN(dateValue) || dateValue < 0) return "Unknown date";
        
        const date = new Date(dateValue);
        if (!isNaN(date.getTime())) {
          return format(date, "MMM d, yyyy HH:mm");
        }
        return "Unknown date";
      }
      
      return "Unknown date";
    } catch (error) {
      console.error("Error formatting date:", error, "Date value:", dateValue);
      return "Unknown date";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <button 
          onClick={() => onNavigate("/")}
          className="text-ezblue hover:underline"
        >
          Root
        </button>
        
        {pathParts.map((part, index) => (
          <div key={index} className="flex items-center">
            <span className="mx-1 text-ezgray">/</span>
            <button
              onClick={() => handlePathClick(index)}
              className="text-ezblue hover:underline truncate max-w-[100px]"
              title={part}
            >
              {part}
            </button>
          </div>
        ))}
      </div>

      <div className="rounded-md border border-ezgray-dark">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Name</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Modified</TableHead>
              <TableHead>Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-ezblue"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : files.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  No files in this directory
                </TableCell>
              </TableRow>
            ) : (
              files.map((file) => (
                <TableRow
                  key={file.name}
                  className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700"
                  onClick={() => handleFileClick(file)}
                >
                  <TableCell className="font-medium flex items-center">
                    {file.isDirectory || file.type === "directory" ? (
                      <FolderIcon className="h-4 w-4 mr-2 text-blue-500" />
                    ) : (
                      <FileIcon className="h-4 w-4 mr-2 text-gray-500" />
                    )}
                    <span className="truncate max-w-[200px]" title={file.name}>
                      {file.name}
                    </span>
                  </TableCell>
                  <TableCell>
                    {file.isDirectory || file.type === "directory" ? "--" : formatFileSize(file.size)}
                  </TableCell>
                  <TableCell>
                    {formatDate(file.modified)}
                  </TableCell>
                  <TableCell>
                    {file.isDirectory || file.type === "directory" ? "Directory" : "File"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
