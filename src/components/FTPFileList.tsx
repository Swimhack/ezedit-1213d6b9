
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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface FileItem {
  name: string;
  size: number;
  modified: string;
  type: "directory" | "file";
  isDirectory: boolean;
}

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

  return (
    <div className="space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => onNavigate("/")}>
              Root
            </BreadcrumbLink>
          </BreadcrumbItem>
          
          {pathParts.map((part, index) => (
            <BreadcrumbItem key={index}>
              <BreadcrumbSeparator />
              <BreadcrumbLink onClick={() => handlePathClick(index)}>
                {part}
              </BreadcrumbLink>
            </BreadcrumbItem>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

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
                    {format(new Date(file.modified), "MMM d, yyyy HH:mm")}
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
