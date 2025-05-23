
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useFileTreeCache } from '@/store/fileExplorerStore';
import { supabase } from '@/integrations/supabase/client';

// Importing TreeNode type from TreeItem component for consistency
import { TreeNode } from '@/components/tree/TreeItem';

interface FileItem {
  name: string;
  type: string;
  isDirectory: boolean;
  path?: string;
  size?: number;
  modified?: string | Date;
}

interface UseFileTreeProps {
  connection: {
    id: string;
  };
  disabled?: boolean; // Add disabled prop
}

export function useFileTree({ connection, disabled = false }: UseFileTreeProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('/');
  const { cacheTreeData, getCachedTreeData } = useFileTreeCache();
  const connectionId = connection?.id;

  const loadDirectory = useCallback(async (path: string) => {
    if (!connectionId || disabled) {
      if (disabled) {
        setError('Directory loading is disabled');
      } else {
        setError('No connection selected');
      }
      return;
    }
    
    // Sanitize path - ensure it starts with a slash
    const safePath = path.startsWith('/') ? path : `/${path}`;
    console.log(`[useFileTree] Loading directory: ${safePath} for connection: ${connectionId}`);
    
    setIsLoading(true);
    setError(null);

    try {
      // Check cache first
      const cachedData = getCachedTreeData(connectionId, safePath);
      if (cachedData && cachedData.length > 0) {
        console.log(`[useFileTree] Using cached data for ${safePath}`);
        setTreeData(cachedData);
        setCurrentPath(safePath);
        setIsLoading(false);
        return;
      }
      
      // Make API call to list directory with cache busting
      console.time(`[FTP] List ${safePath}`);
      const response = await supabase.functions.invoke('ftp-list', {
        body: { 
          siteId: connectionId, 
          path: safePath
        }
      });
      console.timeEnd(`[FTP] List ${safePath}`);
      
      const { data, error } = response;
      
      if (error) {
        console.error("[useFileTree] Supabase function error:", error);
        setError(error.message || "Failed to load directory");
        toast.error(`Error loading directory: ${error.message}`);
        setIsLoading(false);
        return;
      }
      
      console.log("Directory listing response:", data);
      
      if (data.success) {
        // Create tree nodes from files using the exact metadata from server
        const nodes = data.files.map((file: FileItem) => ({
          name: file.name,
          path: file.path || `${safePath === "/" ? "" : safePath}/${file.name}${file.isDirectory ? "/" : ""}`.replace(/\/+/g, "/"),
          isFolder: file.isDirectory,
          isOpen: false,
          isLoaded: false,
          isDirectory: file.isDirectory,
          size: file.size,
          modified: file.modified
        })) as TreeNode[];
        
        setTreeData(nodes);
        setCurrentPath(safePath);
        
        // Cache the result
        cacheTreeData(connectionId, safePath, nodes);
      } else {
        setError(data.message || "Failed to load directory");
        toast.error(`Error: ${data.message || "Unknown error"}`);
      }
    } catch (err: any) {
      console.error("[useFileTree] Error loading directory:", err);
      setError(err.message || "Failed to load directory");
      toast.error(`Error loading directory: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [connectionId, disabled, cacheTreeData, getCachedTreeData]);

  const toggleDirectory = useCallback((nodeId: string) => {
    if (disabled) {
      return;
    }
    
    setTreeData(prevData => {
      return prevData.map(node => {
        if (node.path === nodeId) {
          // Toggle the open state
          return { ...node, isOpen: !node.isOpen };
        }
        return node;
      });
    });
    
    // If this is a directory, load its contents
    const node = treeData.find(node => node.path === nodeId);
    if (node && node.isFolder && !node.isLoaded) {
      loadDirectory(nodeId);
    }
  }, [treeData, loadDirectory, disabled]);

  const refreshDirectory = useCallback(() => {
    if (!disabled) {
      loadDirectory(currentPath);
    }
  }, [currentPath, loadDirectory, disabled]);

  return {
    treeData,
    isLoading,
    error,
    currentPath,
    loadDirectory,
    refreshDirectory,
    toggleDirectory
  };
}
