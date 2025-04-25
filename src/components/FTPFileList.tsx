
import { useState } from "react";
import { format, isValid, parseISO } from "date-fns";
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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { FileItem } from "@/types/ftp";

interface FTPFileListProps {
  currentPath: string;
  files: FileItem[];
  onNavigate: (newPath: string) => void;
  isLoading: boolean;
}

export function FTPFileList({ currentPath, files, onNavigate, isLoading }: FTPFileListProps) {
  const pathParts = currentPath.split('/').filter(Boolean);

  const handlePathClick = (index: number) => {
    const newPath = '/' + pathParts.slice(0, index + 1).join('/') + '/';
    onNavigate(newPath);
  };

  const handleFileClick = (file: FileItem) => {
    if (file.isDirectory) {
      const newPath = currentPath.endsWith('/') 
        ? `${currentPath}${file.name}/`
        : `${currentPath}/${file.name}/`;
      onNavigate(newPath);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      if (isValid(date)) {
        return format(date, "MMM d, yyyy HH:mm");
      }
      
      const timestamp = Number(dateString);
      if (!isNaN(timestamp)) {
        const dateFromTimestamp = new Date(timestamp);
        if (isValid(dateFromTimestamp)) {
          return format(dateFromTimestamp, "MMM d, yyyy HH:mm");
        }
      }
      
      return "Invalid date";
    } catch (error) {
      console.error("Error formatting date:", error, "Date string:", dateString);
      return "Unknown date";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button 
          onClick={() => onNavigate("/")}
          className="text-sm hover:underline"
        >
          Root
        </button>
        
        {pathParts.map((part, index) => (
          <div key={index} className="flex items-center">
            <span className="mx-1">/</span>
            <button
              onClick={() => handlePathClick(index)}
              className="text-sm hover:underline"
            >
              {part}
            </button>
          </div>
        ))}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Modified</TableHead>
              <TableHead>Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : files.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No files in this directory
                </TableCell>
              </TableRow>
            ) : (
              files.map((file) => (
                <TableRow
                  key={file.name}
                  className={file.isDirectory ? "cursor-pointer hover:bg-muted/50" : ""}
                  onClick={() => handleFileClick(file)}
                >
                  <TableCell className="font-medium flex items-center">
                    {file.isDirectory ? (
                      <FolderIcon className="h-4 w-4 mr-2 text-blue-500" />
                    ) : (
                      <FileIcon className="h-4 w-4 mr-2 text-gray-500" />
                    )}
                    {file.name}
                  </TableCell>
                  <TableCell>
                    {file.isDirectory ? "--" : formatFileSize(file.size)}
                  </TableCell>
                  <TableCell>
                    {formatDate(file.modified)}
                  </TableCell>
                  <TableCell>
                    {file.isDirectory ? "Directory" : "File"}
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
