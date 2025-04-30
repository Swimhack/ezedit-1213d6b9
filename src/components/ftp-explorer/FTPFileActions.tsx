
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Copy, Download, Edit, Trash2 } from "lucide-react";

interface FTPFileActionsProps {
  ftpHost: string;
  file: {
    name: string;
    type: 'file' | 'directory';
  };
  onDownload: (fileName: string) => void;
  onEdit: () => void;
  onRename: (fileName: string) => void;
  onDelete: (fileName: string) => void;
}

export function FTPFileActions({
  ftpHost,
  file,
  onDownload,
  onEdit,
  onRename,
  onDelete
}: FTPFileActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(ftpHost)}>
          <Copy className="mr-2 h-4 w-4" />
          Copy FTP Host
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onDownload(file.name)}>
          <Download className="mr-2 h-4 w-4" />
          Download
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onEdit}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onRename(file.name)}>
          Rename
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDelete(file.name)}>
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
