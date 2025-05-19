
import React, { useState, useRef, useEffect } from "react";
import { SimpleFTPFileList } from "@/components/SimpleFTPFileList";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { FileActionToolbar } from "@/components/ftp-explorer/FileActionToolbar";
import { useFileContent } from "@/hooks/useFileContent";
import { useFtpFileOperations } from "@/hooks/file-explorer/use-ftp-file-operations";
import { Loader, FileCode2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { useLocalStorage } from "@/hooks/use-local-storage";

interface CodeEditorViewProps {
  connection: {
    id: string;
    host: string;
    username: string;
    password: string;
  } | null;
}

export function CodeEditorView({ connection }: CodeEditorViewProps) {
  const [currentPath, setCurrentPath] = useState<string>("/");
  const [currentFilePath, setCurrentFilePath] = useState<string>("");
  const [files, setFiles] = useState<any[]>([]);
  const editorRef = useRef<any>(null);
  
  // Panel sizes with local storage persistence
  const [panelSizes, setPanelSizes] = useLocalStorage("code-editor-panels", {
    fileTree: 25,
    editor: 75,
  });
  
  const { 
    loadDirectory, 
    fetchFileContent,
    refreshDirectoryFromServer, 
    isLoading: isDirectoryLoading,
    error: directoryError
  } = useFtpFileOperations();
  
  const { 
    content, 
    isLoading: isFileLoading, 
    error: fileError,
    hasUnsavedChanges,
    isSaving,
    updateContent,
    saveContent
  } = useFileContent({
    connection,
    filePath: currentFilePath
  });

  // Load initial directory
  useEffect(() => {
    if (connection?.id) {
      loadDirectoryContents(currentPath);
    }
  }, [connection]);
  
  // Helper to determine file extension for syntax highlighting
  const getFileLanguage = (filePath: string) => {
    if (!filePath) return 'plaintext';
    const extension = filePath.split('.').pop() || '';
    return extension;
  };

  const loadDirectoryContents = async (path: string) => {
    if (!connection?.id) return;

    try {
      const result = await loadDirectory(connection.id, path);
      setFiles(result.files || []);
      setCurrentPath(path);
    } catch (err) {
      console.error("Error loading directory:", err);
    }
  };

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
    loadDirectoryContents(path);
  };

  const handleSelectFile = (file: { key: string; isDir: boolean }) => {
    if (file.isDir) {
      handleNavigate(file.key);
    } else {
      setCurrentFilePath(file.key);
    }
  };

  const handleRefreshDirectory = async () => {
    if (!connection?.id) return;
    
    try {
      const result = await refreshDirectoryFromServer(connection.id, currentPath);
      setFiles(result.files || []);
    } catch (err) {
      console.error("Error refreshing directory:", err);
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      updateContent(value);
    }
  };

  // Handle panel resize
  const handlePanelResize = (sizes: number[]) => {
    setPanelSizes({
      fileTree: sizes[0],
      editor: sizes[1],
    });
    
    // Force Monaco editor to resize
    setTimeout(() => {
      if (editorRef.current) {
        try {
          editorRef.current.layout();
        } catch (err) {
          console.error('Error resizing editor:', err);
        }
      }
    }, 100);
  };

  return (
    <ResizablePanelGroup
      direction="horizontal"
      onLayout={handlePanelResize}
      className="h-full border rounded-md"
    >
      {/* File Tree Panel */}
      <ResizablePanel 
        defaultSize={panelSizes.fileTree} 
        minSize={15} 
        maxSize={40}
        className="border-r"
      >
        <div className="h-full overflow-hidden flex flex-col bg-white dark:bg-gray-950">
          <div className="p-2 font-medium text-sm border-b">
            File Explorer
          </div>
          
          <div className="flex-grow overflow-auto">
            <SimpleFTPFileList
              currentPath={currentPath}
              files={files}
              onNavigate={handleNavigate}
              onSelectFile={handleSelectFile}
              isLoading={isDirectoryLoading}
              onRefresh={handleRefreshDirectory}
            />
          </div>
        </div>
      </ResizablePanel>
      
      <ResizableHandle />
      
      {/* Editor Panel */}
      <ResizablePanel defaultSize={panelSizes.editor} minSize={30}>
        <div className="h-full flex flex-col">
          {/* Editor Toolbar */}
          {currentFilePath && (
            <FileActionToolbar
              fileName={currentFilePath.split('/').pop() || ''}
              hasUnsavedChanges={hasUnsavedChanges}
              isSaving={isSaving}
              onSave={saveContent}
              isError={!!fileError}
              errorMessage={fileError || undefined}
            />
          )}
          
          {/* Editor Content Area */}
          <div className="flex-grow overflow-hidden">
            {!currentFilePath ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <FileCode2 size={48} className="mb-4" />
                <p>Select a file from the explorer to edit</p>
              </div>
            ) : isFileLoading ? (
              <div className="flex flex-col items-center justify-center h-full">
                <Loader className="h-8 w-8 animate-spin text-blue-500 mb-4" />
                <p>Loading file content...</p>
              </div>
            ) : fileError ? (
              <div className="flex flex-col items-center justify-center h-full">
                <AlertTriangle className="h-10 w-10 text-red-500 mb-4" />
                <p className="text-red-500 font-medium mb-2">Error loading file</p>
                <p className="text-gray-500 max-w-md text-center mb-4">{fileError}</p>
                <Button 
                  onClick={() => {
                    if (connection?.id && currentFilePath) {
                      fetchFileContent(connection.id, currentFilePath);
                    }
                  }}
                >
                  Try Again
                </Button>
              </div>
            ) : (
              <CodeEditor
                content={content}
                language={getFileLanguage(currentFilePath)}
                onChange={handleEditorChange}
                editorRef={editorRef}
              />
            )}
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
