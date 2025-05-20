
import React, { useState, useEffect } from "react";
import { Folder, File, ChevronRight, ChevronDown, RefreshCw, Loader } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface FileExplorerProps {
  connection: {
    id: string;
    host: string;
    username: string;
    password: string;
  };
  onSelectFile: (filePath: string, isDirectory: boolean) => void;
  selectedFilePath: string | null;
}

interface FileNode {
  id: string;
  name: string;
  path: string;
  isDir: boolean;
  children?: FileNode[];
  isExpanded?: boolean;
  isLoading?: boolean;
}

export function FileExplorer({ connection, onSelectFile, selectedFilePath }: FileExplorerProps) {
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState<string>("/");

  useEffect(() => {
    loadFiles();
  }, [connection]);

  const loadFiles = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      const mockFiles: FileNode[] = [
        {
          id: "folder-1",
          name: "public_html",
          path: "/public_html",
          isDir: true,
          children: [
            {
              id: "file-1",
              name: "index.html",
              path: "/public_html/index.html",
              isDir: false
            },
            {
              id: "file-2",
              name: "styles.css",
              path: "/public_html/styles.css",
              isDir: false
            },
            {
              id: "file-3",
              name: "script.js",
              path: "/public_html/script.js",
              isDir: false
            }
          ]
        },
        {
          id: "folder-2",
          name: "assets",
          path: "/assets",
          isDir: true,
          children: [
            {
              id: "folder-3",
              name: "images",
              path: "/assets/images",
              isDir: true,
              children: []
            },
            {
              id: "folder-4",
              name: "css",
              path: "/assets/css",
              isDir: true,
              children: []
            }
          ]
        },
        {
          id: "file-4",
          name: "config.php",
          path: "/config.php",
          isDir: false
        },
        {
          id: "file-5",
          name: ".htaccess",
          path: "/.htaccess",
          isDir: false
        }
      ];
      
      setFileTree(mockFiles);
    } catch (err) {
      console.error("Failed to load files:", err);
      setError(err instanceof Error ? err.message : "Failed to load files");
      toast.error("Failed to load file explorer");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFolder = async (node: FileNode) => {
    if (!node.isDir) return;
    
    const updateNodeInTree = (nodes: FileNode[], targetPath: string, updater: (node: FileNode) => FileNode): FileNode[] => {
      return nodes.map(node => {
        if (node.path === targetPath) {
          return updater(node);
        }
        if (node.children) {
          return {
            ...node,
            children: updateNodeInTree(node.children, targetPath, updater)
          };
        }
        return node;
      });
    };
    
    // Toggle expansion state
    setFileTree(prevTree => 
      updateNodeInTree(prevTree, node.path, (n) => ({
        ...n,
        isExpanded: !n.isExpanded,
        isLoading: !n.isExpanded && (!n.children || n.children.length === 0)
      }))
    );
    
    // If expanding and no children loaded yet, fetch them
    if (!node.isExpanded && (!node.children || node.children.length === 0)) {
      try {
        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock children data
        const mockChildren: FileNode[] = [
          {
            id: `${node.id}-child-1`,
            name: "file1.txt",
            path: `${node.path}/file1.txt`,
            isDir: false
          },
          {
            id: `${node.id}-child-2`,
            name: "file2.html",
            path: `${node.path}/file2.html`,
            isDir: false
          }
        ];
        
        // Update the tree with the new children
        setFileTree(prevTree => 
          updateNodeInTree(prevTree, node.path, (n) => ({
            ...n,
            children: mockChildren,
            isLoading: false
          }))
        );
      } catch (err) {
        console.error("Failed to load folder contents:", err);
        toast.error(`Failed to load contents of ${node.name}`);
        
        // Mark as not loading and not expanded
        setFileTree(prevTree => 
          updateNodeInTree(prevTree, node.path, (n) => ({
            ...n,
            isExpanded: false,
            isLoading: false
          }))
        );
      }
    }
  };

  const renderFileTree = (nodes: FileNode[], level = 0) => {
    return (
      <ul className={cn("pl-0", level > 0 && "pl-4")}>
        {nodes.map((node) => (
          <li key={node.id} className="py-1">
            <div 
              className={cn(
                "flex items-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1 cursor-pointer",
                selectedFilePath === node.path && "bg-blue-100 dark:bg-blue-900"
              )}
              onClick={() => node.isDir ? toggleFolder(node) : onSelectFile(node.path, false)}
            >
              <span className="w-5 h-5 flex items-center justify-center mr-1">
                {node.isDir && (
                  node.isLoading ? (
                    <Loader size={14} className="animate-spin text-gray-400" />
                  ) : node.isExpanded ? (
                    <ChevronDown size={14} />
                  ) : (
                    <ChevronRight size={14} />
                  )
                )}
              </span>
              
              {node.isDir ? (
                <Folder size={16} className="text-yellow-500 mr-2" />
              ) : (
                <File size={16} className="text-blue-500 mr-2" />
              )}
              
              <span className="text-sm truncate">{node.name}</span>
            </div>
            
            {node.isDir && node.isExpanded && node.children && (
              renderFileTree(node.children, level + 1)
            )}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between border-b p-3 bg-gray-50 dark:bg-gray-800">
        <h3 className="font-medium text-sm">File Explorer</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0" 
          onClick={loadFiles}
          disabled={isLoading}
        >
          <RefreshCw size={16} className={cn(isLoading && "animate-spin")} />
          <span className="sr-only">Refresh</span>
        </Button>
      </div>
      
      <div className="flex-grow overflow-auto p-2">
        {isLoading && fileTree.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Loader className="h-6 w-6 animate-spin text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">Loading files...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-sm text-red-500 mb-2">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadFiles}
            >
              Try Again
            </Button>
          </div>
        ) : fileTree.length === 0 ? (
          <p className="text-sm text-gray-500 text-center mt-4">No files found</p>
        ) : (
          renderFileTree(fileTree)
        )}
      </div>
    </div>
  );
}
