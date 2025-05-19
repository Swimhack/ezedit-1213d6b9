
import React from "react";
import { File, Folder, FolderOpen, ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileItemProps {
  name: string;
  path?: string;
  isDirectory?: boolean;
  isSelected?: boolean;
  isExpanded?: boolean;
  size?: number;
  modified?: Date | string | number;
  onSelect: () => void;
  onExpand?: () => void;
}

export function FileListItem({
  name,
  path,
  isDirectory = false,
  isSelected = false,
  isExpanded = false,
  size,
  modified,
  onSelect,
  onExpand
}: FileItemProps) {
  const handleClick = () => {
    if (isDirectory && onExpand) {
      onExpand();
    } else {
      onSelect();
    }
  };

  // Format the file size for display
  const formatSize = (size?: number) => {
    if (!size) return "";
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / 1024 / 1024).toFixed(1)} MB`;
  };

  // Format the modified date for display
  const formatDate = (date?: Date | string | number) => {
    if (!date) return "";
    try {
      const d = new Date(date);
      return d.toLocaleDateString();
    } catch (e) {
      return "";
    }
  };

  return (
    <div
      className={cn(
        "flex items-center px-2 py-1.5 text-sm rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800",
        isSelected && "bg-blue-50 dark:bg-blue-900/30"
      )}
      onClick={handleClick}
    >
      <div className="flex items-center mr-2">
        {isDirectory && (
          <div className="mr-1">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-400" />
            )}
          </div>
        )}
        <div>
          {isDirectory ? (
            isExpanded ? (
              <FolderOpen className="h-4 w-4 text-yellow-400" />
            ) : (
              <Folder className="h-4 w-4 text-yellow-400" />
            )
          ) : (
            <File className="h-4 w-4 text-blue-500" />
          )}
        </div>
      </div>
      <div className="flex-grow truncate">{name}</div>
      <div className="flex gap-2 text-xs text-gray-500">
        {!isDirectory && size !== undefined && (
          <span>{formatSize(size)}</span>
        )}
        {modified && (
          <span>{formatDate(modified)}</span>
        )}
      </div>
    </div>
  );
}
