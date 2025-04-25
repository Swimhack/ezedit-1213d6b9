
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { FileItem } from "@/types/ftp";

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

interface UseFileTreeProps {
  connection: {
    host: string;
    port: number;
    username: string;
    password: string;
  };
}

export function useFileTree({ connection }: UseFileTreeProps) {
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
          const rootTree = data.files.map((file: FileItem) => ({
            name: file.name,
            path: `/${file.name}`,
            isDirectory: file.isDirectory,
            children: [],
            isOpen: false,
            isLoaded: false,
            size: file.size,
            modified: file.modified
          }));
          setTreeData(rootTree);
        } else {
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
        if (pathParts.length === 0 || (pathParts.length === 1 && pathParts[0] === "")) {
          return nodes;
        }
        
        const currentPart = pathParts[0];
        const remainingParts = pathParts.slice(1);
        
        return nodes.map(node => {
          if (node.name === currentPart) {
            if (remainingParts.length === 0 || (remainingParts.length === 1 && remainingParts[0] === "")) {
              return {
                ...node,
                isLoaded: true,
                children: files.map(file => ({
                  name: file.name,
                  path: `${path}${path.endsWith('/') ? '' : '/'}${file.name}`,
                  isDirectory: file.isDirectory,
                  children: [],
                  isOpen: false,
                  isLoaded: false,
                  size: file.size,
                  modified: file.modified
                }))
              };
            }
            
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
        fetchDirectoryContent(node.path);
      }
      
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

  useEffect(() => {
    if (connection) {
      fetchDirectoryContent("/");
    }
  }, [connection]);

  return {
    treeData,
    isLoading,
    toggleDirectory
  };
}
