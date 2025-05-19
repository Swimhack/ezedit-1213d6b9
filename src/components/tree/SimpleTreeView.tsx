
import React from "react";
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
}

interface SimpleTreeViewProps {
  nodes: TreeNode[];
  onToggle: (node: TreeNode) => void;
  onSelect: (node: TreeNode) => void;
  activeFilePath?: string;
}

export function SimpleTreeView({ nodes, onToggle, onSelect, activeFilePath }: SimpleTreeViewProps) {
  return (
    <div className="w-full h-full overflow-auto p-1">
      <ul className="space-y-1">
        {nodes.map((node) => (
          <SimpleTreeItem
            key={node.path}
            node={node}
            activeFilePath={activeFilePath}
            onToggle={onToggle}
            onSelect={onSelect}
            level={0}
          />
        ))}
      </ul>
    </div>
  );
}

interface SimpleTreeItemProps {
  node: TreeNode;
  level: number;
  activeFilePath?: string;
  onToggle: (node: TreeNode) => void;
  onSelect: (node: TreeNode) => void;
}

function SimpleTreeItem({ node, level, activeFilePath, onToggle, onSelect }: SimpleTreeItemProps) {
  const isActive = activeFilePath === node.path;
  
  const handleClick = () => {
    if (node.isFolder) {
      onToggle(node);
    } else {
      onSelect(node);
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
          {node.isFolder ? (
            node.isOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )
          ) : null}
        </div>
        <div className="mr-2 w-4">
          {node.isFolder ? (
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
      
      {node.isFolder && node.isOpen && node.children && (
        <ul className="pl-2">
          {node.children.map((childNode) => (
            <SimpleTreeItem
              key={childNode.path}
              node={childNode}
              level={level + 1}
              activeFilePath={activeFilePath}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
