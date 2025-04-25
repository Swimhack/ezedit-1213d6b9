
import { useState, useEffect } from "react";
import { ChevronRight, ChevronDown, FolderIcon, FileIcon } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { FileItem } from "@/types/ftp";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FileTreeProps {
  connection: {
    id: string;
    server_name: string;
    host: string;
    port: number;
    username: string;
    password: string;
  };
  onSelectFile: (path: string) => void;
  activeFilePath?: string;
}

interface TreeNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children: TreeNode[];
  isOpen?: boolean;
  isLoaded?: boolean;
}

export default function FileTree({ connection, onSelectFile, activeFilePath }: FileTreeProps) {
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch root directory on component mount
  useEffect(() => {
    if (connection) {
      fetchDirectoryContent("/");
    }
  }, [connection]);

  const fetchDirectoryContent = async (path: string) => {
    if (!connection) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`https://natjhcqynqziccssnwim.supabase.co/functions/v1/ftp-list-directory`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          host: connection.host,
          port: connection.port,
          username: connection.username,
          password: connection.password,
          path: path
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        if (path === "/") {
          // For root level, set the entire tree
          const rootTree = data.files.map((file: FileItem) => ({
            name: file.name,
            path: `/${file.name}`,
            isDirectory: file.isDirectory,
            children: [],
            isOpen: false,
            isLoaded: false
          }));
          setTreeData(rootTree);
        } else {
          // For nested directories, update only that branch
          updateTreeBranch(path, data.files);
        }
      } else {
        toast.error(`Failed to list directory: ${data.message}`);
      }
    } catch (error: any) {
      toast.error(`Error listing directory: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const updateTreeBranch = (path: string, files: FileItem[]) => {
    setTreeData(prevTree => {
      const updateNode = (nodes: TreeNode[], pathParts: string[]): TreeNode[] => {
        // If we've processed all path parts, this is the target directory
        if (pathParts.length === 0 || (pathParts.length === 1 && pathParts[0] === "")) {
          return nodes;
        }
        
        const currentPart = pathParts[0];
        const remainingParts = pathParts.slice(1);
        
        return nodes.map(node => {
          if (node.name === currentPart) {
            if (remainingParts.length === 0 || (remainingParts.length === 1 && remainingParts[0] === "")) {
              // This is the target directory, update its children
              return {
                ...node,
                isLoaded: true,
                children: files.map(file => ({
                  name: file.name,
                  path: `${path}${path.endsWith('/') ? '' : '/'}${file.name}`,
                  isDirectory: file.isDirectory,
                  children: [],
                  isOpen: false,
                  isLoaded: false
                }))
              };
            }
            
            // Continue searching in this node's children
            return {
              ...node,
              children: updateNode(node.children, remainingParts)
            };
          }
          return node;
        });
      };
      
      const pathParts = path.split('/').filter(Boolean);
      return updateNode(prevTree, pathParts);
    });
  };

  const toggleDirectory = (node: TreeNode) => {
    if (node.isDirectory) {
      if (!node.isLoaded) {
        // Load the directory contents if not already loaded
        fetchDirectoryContent(node.path);
      }
      
      // Toggle the directory open/closed state
      setTreeData(prevTree => {
        const toggleNode = (nodes: TreeNode[]): TreeNode[] => {
          return nodes.map(n => {
            if (n.path === node.path) {
              return { ...n, isOpen: !n.isOpen };
            } else if (n.children.length > 0) {
              return { ...n, children: toggleNode(n.children) };
            }
            return n;
          });
        };
        
        return toggleNode(prevTree);
      });
    }
  };

  const handleFileClick = (node: TreeNode) => {
    if (!node.isDirectory) {
      onSelectFile(node.path);
    }
  };

  const renderTree = (nodes: TreeNode[]) => {
    return (
      <ul className="pl-2 space-y-1">
        {nodes.map((node) => (
          <li key={node.path} className="relative">
            <div
              className={`flex items-center py-1 px-2 hover:bg-eznavy rounded cursor-pointer ${
                !node.isDirectory && node.path === activeFilePath ? "bg-eznavy-light" : ""
              }`}
              onClick={() => node.isDirectory ? toggleDirectory(node) : handleFileClick(node)}
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
            {node.isDirectory && node.isOpen && node.children.length > 0 && renderTree(node.children)}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="h-full">
      <ScrollArea className="h-[calc(100vh-180px)]">
        {isLoading && treeData.length === 0 ? (
          <div className="flex justify-center items-center h-20">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-ezblue"></div>
          </div>
        ) : (
          renderTree(treeData)
        )}
      </ScrollArea>
    </div>
  );
}
