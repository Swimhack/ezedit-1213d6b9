
import { formatFileSize } from "@/lib/utils";
import { format } from "date-fns";
import { FileIcon, FolderIcon } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";

interface FileItemProps {
  file: {
    name: string;
    size?: number;
    modified?: Date | string | number;
    isDirectory?: boolean;
    type?: string;
  };
  onClick: () => void;
}

export function FileListItem({ file, onClick }: FileItemProps) {
  const formatDate = (dateValue: any) => {
    try {
      if (!dateValue) return "Unknown date";
      
      if (dateValue instanceof Date) {
        if (isNaN(dateValue.getTime())) {
          return "Unknown date";
        }
        return format(dateValue, "MMM d, yyyy HH:mm");
      }
      
      if (typeof dateValue === 'string') {
        if (!dateValue.trim()) return "Unknown date";
        
        const date = new Date(dateValue);
        if (!isNaN(date.getTime())) {
          return format(date, "MMM d, yyyy HH:mm");
        }
        return "Unknown date";
      }
      
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

  const isFolder = file.isDirectory || file.type === "directory";
  
  return (
    <TableRow
      className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700"
      onClick={onClick}
    >
      <TableCell className="font-medium flex items-center">
        {isFolder ? (
          <FolderIcon className="h-4 w-4 mr-2 text-blue-500" />
        ) : (
          <FileIcon className="h-4 w-4 mr-2 text-gray-500" />
        )}
        <span className="truncate max-w-[200px]" title={file.name}>
          {file.name}
        </span>
      </TableCell>
      <TableCell>
        {isFolder ? "--" : formatFileSize(file.size || 0)}
      </TableCell>
      <TableCell>
        {formatDate(file.modified)}
      </TableCell>
      <TableCell>
        {isFolder ? "Directory" : "File"}
      </TableCell>
    </TableRow>
  );
}
