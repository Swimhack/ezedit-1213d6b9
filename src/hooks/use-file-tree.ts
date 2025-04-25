
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
    
    // Ensure path is never empty; default to root path "/"
    const safePath = path?.trim() === "" ? "/" : path;
    
    setIsLoading(true);
    try {
      console.log(`Fetching directory content for path: ${safePath}`);
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
          path: safePath
        }),
      });

      const data = await response.json();
      console.log("Directory listing response:", data);
      
      if (data.success) {
        // Create tree nodes from files
        const nodes = data.files.map((file: FileItem) => ({
          name: file.name,
          path: `${safePath === "/" ? "" : safePath}/${file.name}${file.isDirectory ? "/" : ""}`.replace(/\/+/g, "/"),
          isDirectory: file.isDirectory,
          children: [],
          isOpen: false,
          isLoaded: false,
          size: file.size,
          modified: file.modified
        }));
        
        setTreeData(nodes);
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

  const toggleDirectory = async (node: TreeNode) => {
    if (!node.isDirectory) return;

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

    // If not loaded yet, fetch the directory contents
    if (!node.isLoaded) {
      try {
        // Ensure we're using a valid path
        const safePath = node.path || "/";
        await fetchDirectoryContent(safePath);
      } catch (error) {
        console.error("Error fetching directory contents:", error);
      }
    }
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
