
import { ChevronRight, ChevronDown, FolderIcon, FileIcon } from "lucide-react";

interface TreeNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children: TreeNode[];
  isOpen?: boolean;
}

interface TreeItemProps {
  node: TreeNode;
  activeFilePath?: string;
  onToggle: (node: TreeNode) => void;
  onSelectFile: (path: string) => void;
}

export function TreeItem({ node, activeFilePath, onToggle, onSelectFile }: TreeItemProps) {
  const handleClick = () => {
    if (node.isDirectory) {
      onToggle(node);
    } else {
      onSelectFile(node.path);
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
      {node.isDirectory && node.isOpen && node.children.length > 0 && (
        <ul className="pl-2 space-y-1">
          {node.children.map((childNode) => (
            <TreeItem
              key={childNode.path}
              node={childNode}
              activeFilePath={activeFilePath}
              onToggle={onToggle}
              onSelectFile={onSelectFile}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
