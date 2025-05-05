
import React, { useEffect, useState } from 'react';
import { Tree } from 'react-arborist';
import { Folder, File, ChevronRight, ChevronDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface FileNode {
  id: string;
  name: string;
  type: 'directory' | 'file';
  children?: FileNode[];
  isOpen?: boolean;
  path: string;
}

interface FileExplorerProps {
  connection: any;
  onSelectFile: (file: FileNode) => void;
}

export function FileExplorer({ connection, onSelectFile }: FileExplorerProps) {
  const [treeData, setTreeData] = useState<FileNode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (connection) {
      loadRootDirectory();
    }
  }, [connection]);

  const loadRootDirectory = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('listFtpFiles', {
        body: {
          host: connection.host,
          user: connection.username,
          pass: connection.password,
          dir: '/',
          port: connection.port || 21,
          sftp: false // Add SFTP support later
        }
      });

      if (error) {
        toast.error(`Error loading files: ${error.message}`);
        return;
      }

      if (data.success && data.files) {
        // Transform the files into a tree structure
        const files = data.files.map((file: any) => ({
          id: file.path,
          name: file.name,
          type: file.type,
          path: file.path,
          isDirectory: file.isDirectory
        }));

        setTreeData(files);
      }
    } catch (err: any) {
      toast.error(`Failed to load directory: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDirectory = async (node: FileNode) => {
    if (node.type !== 'directory') return;

    try {
      const { data, error } = await supabase.functions.invoke('listFtpFiles', {
        body: {
          host: connection.host,
          user: connection.username,
          pass: connection.password,
          dir: node.path,
          port: connection.port || 21,
          sftp: false
        }
      });

      if (error) {
        toast.error(`Error loading directory: ${error.message}`);
        return;
      }

      if (data.success && data.files) {
        // Transform the files into nodes
        const newChildren = data.files.map((file: any) => ({
          id: file.path,
          name: file.name,
          type: file.type,
          path: file.path,
          isDirectory: file.isDirectory
        }));

        // Update the tree with new children
        setTreeData(prevData => {
          // Create a map for quick lookup
          const map = new Map();
          prevData.forEach(item => map.set(item.id, { ...item }));

          // Update the node with children
          const node = map.get(node.id);
          if (node) {
            node.children = newChildren;
          }

          // Convert map back to array
          return Array.from(map.values());
        });
      }
    } catch (err: any) {
      toast.error(`Failed to load directory: ${err.message}`);
    }
  };

  const handleNodeClick = (node: FileNode) => {
    if (node.type === 'directory') {
      // Toggle expanded state
      setExpandedNodes(prev => ({
        ...prev,
        [node.id]: !prev[node.id]
      }));
      
      // Load contents if not already loaded
      if (!node.children && !expandedNodes[node.id]) {
        loadDirectory(node);
      }
    } else {
      // Handle file selection
      onSelectFile(node);
    }
  };

  const renderNode = ({ node, isOpen, onToggle }: any) => {
    const isDirectory = node.data.type === 'directory';
    
    return (
      <div
        className="flex items-center py-1 px-2 hover:bg-gray-100 rounded cursor-pointer"
        onClick={() => handleNodeClick(node.data)}
      >
        <div className="mr-1">
          {isDirectory ? (
            isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />
          ) : null}
        </div>
        <div className="mr-2">
          {isDirectory ? (
            <Folder className="w-4 h-4 text-yellow-500" />
          ) : (
            <File className="w-4 h-4 text-blue-500" />
          )}
        </div>
        <span className="truncate text-sm">{node.data.name}</span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card className="h-full p-4 overflow-auto">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-6 w-1/2 mb-2" />
        <Skeleton className="h-6 w-2/3 mb-2" />
        <Skeleton className="h-6 w-3/5 mb-2" />
        <Skeleton className="h-6 w-1/3" />
      </Card>
    );
  }

  return (
    <Card className="h-full p-2 overflow-auto">
      <Tree
        data={treeData}
        openByDefault={false}
        width="100%"
        height="100%"
        indent={16}
        rowHeight={28}
        overscanCount={10}
        className="file-explorer"
      >
        {renderNode}
      </Tree>
    </Card>
  );
}
