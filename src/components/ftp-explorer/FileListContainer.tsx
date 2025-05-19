
import React, { useState, useEffect } from "react";
import { FileListItem } from "@/components/ftp-explorer/FileListItem";
import { FileListPathBreadcrumb } from "@/components/ftp-explorer/FileListPathBreadcrumb";
import { FileListActions } from "@/components/ftp-explorer/FileListActions";
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileItem {
  name: string;
  size?: number;
  modified?: Date | string | number;
  isDirectory?: boolean;
  type?: string;
}

interface FileListContainerProps {
  currentPath: string;
  files: FileItem[];
  onNavigate: (newPath: string) => void;
  onSelectFile?: (file: { key: string; isDir: boolean }) => void;
  isLoading: boolean;
  onRefresh?: () => void;
  error?: string | null;
}

export function FileListContainer({
  currentPath,
  files,
  onNavigate,
  onSelectFile,
  isLoading,
  onRefresh,
  error
}: FileListContainerProps) {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  // Reset selected file when path or files change
  useEffect(() => {
    setSelectedFile(null);
  }, [currentPath, files]);

  // Calculate if we're at the root path
  const isRootPath = currentPath === "/" || !currentPath;

  // Handle navigating up one directory
  const handleNavigateUp = () => {
    if (isRootPath) return;
    
    const pathParts = currentPath.split('/').filter(Boolean);
    pathParts.pop();
    const newPath = pathParts.length === 0 ? '/' : `/${pathParts.join('/')}`;
    onNavigate(newPath);
  };

  // Handle navigating to home (root)
  const handleNavigateHome = () => {
    onNavigate('/');
  };

  // Handle navigating to a specific path in the breadcrumb
  const handleNavigatePath = (index: number) => {
    const pathParts = currentPath.split('/').filter(Boolean);
    const newPathParts = pathParts.slice(0, index + 1);
    const newPath = `/${newPathParts.join('/')}`;
    onNavigate(newPath);
  };

  // Handle selecting a file
  const handleSelectFile = (file: FileItem) => {
    const filePath = `${currentPath === '/' ? '' : currentPath}/${file.name}`.replace(/\/\//g, '/');
    setSelectedFile(filePath);
    
    if (onSelectFile && !file.isDirectory) {
      onSelectFile({
        key: filePath,
        isDir: false
      });
    }
  };

  // Handle toggling a directory expand/collapse
  const handleToggleDirectory = (file: FileItem) => {
    if (!file.isDirectory) return;

    const filePath = `${currentPath === '/' ? '' : currentPath}/${file.name}`.replace(/\/\//g, '/');
    
    if (expandedFolders.has(filePath)) {
      // Collapse the directory
      const newExpanded = new Set(expandedFolders);
      newExpanded.delete(filePath);
      setExpandedFolders(newExpanded);
    } else {
      // Expand the directory and navigate to it
      onNavigate(filePath);
      
      // Mark as expanded
      setExpandedFolders(new Set([...expandedFolders, filePath]));
    }
  };

  // Handle possible file click (differentiating between files and directories)
  const handleFileClick = (file: FileItem) => {
    if (file.isDirectory) {
      const dirPath = `${currentPath === '/' ? '' : currentPath}/${file.name}`.replace(/\/\//g, '/');
      onNavigate(dirPath);
    } else {
      handleSelectFile(file);
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="p-4 flex flex-col h-full">
        <FileListActions onNavigateUp={handleNavigateUp} onRefresh={onRefresh} isRootPath={isRootPath} />
        <FileListPathBreadcrumb currentPath={currentPath} onNavigateHome={handleNavigateHome} onNavigatePath={handleNavigatePath} />
        
        <div className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader className="w-8 h-8 animate-spin text-blue-500 mb-2" />
            <div className="text-sm text-gray-600">Loading files...</div>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="p-4 flex flex-col h-full">
        <FileListActions onNavigateUp={handleNavigateUp} onRefresh={onRefresh} isRootPath={isRootPath} />
        <FileListPathBreadcrumb currentPath={currentPath} onNavigateHome={handleNavigateHome} onNavigatePath={handleNavigatePath} />
        
        <div className="flex-grow flex items-center justify-center">
          <div className="p-4 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            {onRefresh && (
              <Button onClick={onRefresh} variant="outline">Try Again</Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Render empty state
  if (files.length === 0) {
    return (
      <div className="p-4 flex flex-col h-full">
        <FileListActions onNavigateUp={handleNavigateUp} onRefresh={onRefresh} isRootPath={isRootPath} />
        <FileListPathBreadcrumb currentPath={currentPath} onNavigateHome={handleNavigateHome} onNavigatePath={handleNavigatePath} />
        
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center text-gray-500">
            <p>This folder is empty</p>
          </div>
        </div>
      </div>
    );
  }

  // Render file list
  return (
    <div className="p-4 flex flex-col h-full">
      <FileListActions onNavigateUp={handleNavigateUp} onRefresh={onRefresh} isRootPath={isRootPath} />
      <FileListPathBreadcrumb currentPath={currentPath} onNavigateHome={handleNavigateHome} onNavigatePath={handleNavigatePath} />
      
      <div className="mt-2 flex-grow overflow-auto">
        <div className="space-y-1">
          {files.map((file) => {
            const filePath = `${currentPath === '/' ? '' : currentPath}/${file.name}`.replace(/\/\//g, '/');
            const isExpanded = expandedFolders.has(filePath);
            const isSelected = filePath === selectedFile;
            
            return (
              <FileListItem
                key={file.name}
                name={file.name}
                path={filePath}
                isDirectory={file.isDirectory || (file.type === '2')}
                size={file.size}
                modified={file.modified}
                isSelected={isSelected}
                isExpanded={isExpanded}
                onSelect={() => handleFileClick(file)}
                onExpand={() => handleToggleDirectory(file)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
