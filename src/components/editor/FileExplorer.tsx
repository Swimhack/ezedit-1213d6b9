
import React, { useState, useEffect, useCallback } from 'react';
import { Tree, NodeRendererProps } from 'react-arborist';
import { Folder, File, ChevronRight, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'dir';
  size?: number;
  modified?: string;
  children?: FileNode[];
}

interface FileExplorerProps {
  connectionId: string;
  onSelectFile: (path: string) => void;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ connectionId, onSelectFile }) => {
  const [files, setFiles] = useState<FileNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState('/');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const loadFiles = useCallback(async (path = '/') => {
    if (!connectionId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('https://natjhcqynqziccssnwim.supabase.co/functions/v1/listFtpFiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          connectionId,
          path
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to load files: ${errorText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to load files');
      }
      
      // Transform the flat list into a tree structure
      const fileNodes: FileNode[] = data.files.map((file: any) => ({
        id: `${path === '/' ? '' : path}/${file.name}`,
        name: file.name,
        type: file.isDir ? 'dir' : 'file',
        size: file.size,
        modified: file.modified,
        children: file.isDir ? [] : undefined
      }));
      
      setFiles(fileNodes);
      setCurrentPath(path);
    } catch (err: any) {
      console.error('Error loading files:', err);
      setError(err.message);
      toast.error(`Error loading files: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [connectionId]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const handleExpandNode = async (node: FileNode) => {
    if (node.type !== 'dir') return;
    
    const nodePath = node.id;
    
    if (expandedNodes.has(nodePath)) {
      // Node is already expanded, just toggle it
      const newExpanded = new Set(expandedNodes);
      newExpanded.delete(nodePath);
      setExpandedNodes(newExpanded);
      return;
    }
    
    // Load children for this directory
    setIsLoading(true);
    try {
      const response = await fetch('https://natjhcqynqziccssnwim.supabase.co/functions/v1/listFtpFiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          connectionId,
          path: nodePath
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to load directory contents');
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to load directory contents');
      }
      
      // Update the tree by adding children to the expanded node
      setFiles(prevFiles => {
        const updateNodeChildren = (nodes: FileNode[]): FileNode[] => {
          return nodes.map(n => {
            if (n.id === nodePath) {
              const children = data.files.map((file: any) => ({
                id: `${nodePath === '/' ? '' : nodePath}/${file.name}`,
                name: file.name,
                type: file.isDir ? 'dir' : 'file',
                size: file.size,
                modified: file.modified,
                children: file.isDir ? [] : undefined
              }));
              return { ...n, children };
            } 
            if (n.children) {
              return { ...n, children: updateNodeChildren(n.children) };
            }
            return n;
          });
        };
        
        return updateNodeChildren(prevFiles);
      });
      
      // Mark this node as expanded
      setExpandedNodes(prev => new Set(prev).add(nodePath));
    } catch (err: any) {
      console.error('Error expanding directory:', err);
      toast.error(`Error loading directory: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectFile = (node: FileNode) => {
    if (node.type === 'file') {
      onSelectFile(node.id);
    } else {
      handleExpandNode(node);
    }
  };

  const NodeRenderer = ({ node, style, dragHandle }: NodeRendererProps<FileNode>) => {
    const isExpanded = expandedNodes.has(node.data.id);
    
    return (
      <div 
        style={style} 
        ref={dragHandle}
        className={`flex items-center p-1 hover:bg-gray-100 cursor-pointer ${node.isSelected ? 'bg-blue-100' : ''}`}
        onClick={() => handleSelectFile(node.data)}
      >
        <div className="mr-1">
          {node.data.type === 'dir' ? (
            isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
          ) : null}
        </div>
        <div className="mr-2">
          {node.data.type === 'dir' ? (
            <Folder size={16} className="text-yellow-500" />
          ) : (
            <File size={16} className="text-blue-500" />
          )}
        </div>
        <div className="text-sm truncate">{node.data.name}</div>
      </div>
    );
  };

  const handleNavigateUp = () => {
    if (currentPath === '/') return;
    
    const parentPath = currentPath.split('/').slice(0, -1).join('/') || '/';
    loadFiles(parentPath);
  };

  const refreshFiles = () => {
    loadFiles(currentPath);
  };

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={refreshFiles}>Try Again</Button>
      </div>
    );
  }

  if (isLoading && files.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-2 border-b">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleNavigateUp}
          disabled={currentPath === '/'}
        >
          Up
        </Button>
        <span className="text-sm truncate flex-1 mx-2">{currentPath}</span>
        <Button variant="ghost" size="sm" onClick={refreshFiles}>Refresh</Button>
      </div>
      <div className="flex-1 overflow-auto">
        <Tree
          data={files}
          openByDefault={false}
          width="100%"
          height={400}
          indent={16}
          rowHeight={24}
          paddingTop={0}
          paddingBottom={0}
          className="h-full"
        >
          {NodeRenderer}
        </Tree>
      </div>
    </div>
  );
};

export default FileExplorer;
