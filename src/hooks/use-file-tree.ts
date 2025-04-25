
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
          // Root directory
          const rootTree = data.files.map((file: FileItem) => ({
            name: file.name,
            path: `/${file.name}${file.isDirectory ? '/' : ''}`,
            isDirectory: file.isDirectory,
            children: [],
            isOpen: false,
            isLoaded: false,
            size: file.size,
            modified: file.modified
          }));
          setTreeData(rootTree);
        } else {
          // Subdirectory
          updateTreeBranch(path, data.files);
        }
      } else {
        toast.error(`Failed to list directory: ${data.message}`);
      }
    } catch (error: any) {
      toast.error(`Error listing directory: ${error.message}`);
      console.error("Directory listing error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateTreeBranch = (path: string, files: FileItem[]) => {
    setTreeData(prevTree => {
      const updateNode = (nodes: TreeNode[], currentPath: string): TreeNode[] => {
        return nodes.map(node => {
          if (node.path === currentPath) {
            // This is the node we want to update
            return {
              ...node,
              isLoaded: true,
              children: files.map(file => ({
                name: file.name,
                path: `${currentPath}${file.name}${file.isDirectory ? '/' : ''}`,
                isDirectory: file.isDirectory,
                children: [],
                isOpen: false,
                isLoaded: false,
                size: file.size,
                modified: file.modified
              }))
            };
          } else if (currentPath.startsWith(node.path) && node.children.length > 0) {
            // The path we're looking for is deeper in this node's children
            return {
              ...node,
              children: updateNode(node.children, currentPath)
            };
          }
          // This node is not affected
          return node;
        });
      };
      
      return updateNode(prevTree, path);
    });
  };

  const toggleDirectory = (node: TreeNode) => {
    if (!node.isDirectory) return;

    // If this is the first time opening this directory, fetch its contents
    if (!node.isLoaded && !node.isOpen) {
      fetchDirectoryContent(node.path);
    }
    
    // Toggle the isOpen state of the node
    setTreeData(prevTree => {
      const toggleNode = (nodes: TreeNode[]): TreeNode[] => {
        return nodes.map(n => {
          if (n.path === node.path) {
            return { ...n, isOpen: !n.isOpen };
          }
          
          if (n.children && n.children.length > 0) {
            return { ...n, children: toggleNode(n.children) };
          }
          
          return n;
        });
      };
      
      return toggleNode(prevTree);
    });
  };

  // Initial load of root directory
  useEffect(() => {
    if (connection) {
      fetchDirectoryContent("/");
    }
  }, [connection]);

  return {
    treeData,
    isLoading,
    toggleDirectory,
    refreshDirectory: fetchDirectoryContent
  };
}
