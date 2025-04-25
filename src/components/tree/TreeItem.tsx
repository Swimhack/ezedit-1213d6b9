
import { ChevronRight, ChevronDown, FolderIcon, FileIcon } from "lucide-react";
import { toast } from "sonner";

interface TreeNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children: TreeNode[];
  isOpen?: boolean;
  isLoaded?: boolean;
  size?: number;
  modified?: string;
}

interface TreeItemProps {
  node: TreeNode;
  activeFilePath?: string;
  onToggle: (node: TreeNode) => void;
  onSelectFile: (path: string) => void;
}

export function TreeItem({ node, activeFilePath, onToggle, onSelectFile }: TreeItemProps) {
  const handleClick = async () => {
    try {
      if (node.isDirectory) {
        await onToggle(node);
      } else {
        onSelectFile(node.path);
      }
    } catch (error: any) {
      toast.error(`Failed to open ${node.isDirectory ? 'directory' : 'file'}: ${error.message}`);
    }
  };

  return (
    <li className="relative">
      <div
        className={`flex items-center py-1 px-2 hover:bg-eznavy rounded cursor-pointer ${
          !node.isDirectory && node.path === activeFilePath ? "bg-eznavy-light" : ""
        }`}
        onClick={handleClick}
      >
        {node.isDirectory ? (
          <>
            <span className="mr-1">
              {node.isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </span>
            <FolderIcon size={16} className="text-blue-400 mr-1" />
          </>
        ) : (
          <>
            <span className="mr-1 w-4"></span>
            <FileIcon size={16} className="text-gray-400 mr-1" />
          </>
        )}
        <span className="text-sm truncate">{node.name}</span>
      </div>
      {node.isDirectory && node.isOpen && node.children && (
        <ul className="pl-4 space-y-1">
          {node.children.length > 0 ? (
            node.children.map((childNode) => (
              <TreeItem
                key={childNode.path}
                node={childNode}
                activeFilePath={activeFilePath}
                onToggle={onToggle}
                onSelectFile={onSelectFile}
              />
            ))
          ) : (
            <li className="text-xs text-gray-400 py-1 px-2">No files</li>
          )}
        </ul>
      )}
    </li>
  );
}
