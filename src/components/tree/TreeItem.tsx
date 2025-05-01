
import { useState } from "react";
import { ChevronRight, ChevronDown, File, Folder, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TreeNode {
  name: string;
  path: string;
  isFolder: boolean;
  isOpen: boolean;
  isLoaded: boolean;
  children?: TreeNode[];
  size?: number;
  modified?: string | Date | null;
  isDirectory?: boolean; // Make this optional for backward compatibility
}

interface TreeItemProps {
  node: TreeNode;
  level?: number;
  activeFilePath?: string;
  onToggle: () => void;
  onSelectFile: (path: string) => void;
}

export function TreeItem({
  node,
  level = 0,
  activeFilePath,
  onToggle,
  onSelectFile
}: TreeItemProps) {
  const isActive = activeFilePath === node.path;
  const isDirectory = node.isFolder || node.isDirectory;
  
  const handleClick = () => {
    if (isDirectory) {
      onToggle();
    } else {
      onSelectFile(node.path);
    }
  };
  
  return (
    <li className="select-none">
      <div
        className={cn(
          "flex items-center py-1 px-2 rounded-md text-sm",
          isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted cursor-pointer",
          level > 0 && "ml-4"
        )}
        onClick={handleClick}
      >
        <div className="mr-1 w-4">
          {isDirectory ? (
            node.isOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )
          ) : null}
        </div>
        <div className="mr-2 w-4">
          {isDirectory ? (
            node.isOpen ? (
              <FolderOpen className="h-4 w-4 text-yellow-400" />
            ) : (
              <Folder className="h-4 w-4 text-yellow-400" />
            )
          ) : (
            <File className="h-4 w-4 text-blue-400" />
          )}
        </div>
        <span className="truncate">{node.name}</span>
      </div>
      
      {isDirectory && node.isOpen && node.children && (
        <ul className="pl-2">
          {node.children.map((childNode) => (
            <TreeItem
              key={childNode.path}
              node={childNode}
              level={level + 1}
              activeFilePath={activeFilePath}
              onToggle={() => onToggle(childNode.path)}
              onSelectFile={onSelectFile}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
