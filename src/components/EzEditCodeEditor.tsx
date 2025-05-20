
import React, { useState, useRef } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { SimpleFTPFileList } from "@/components/SimpleFTPFileList";
import { EditorPane } from "@/components/editor/EditorPane";
import { useLocalStorage } from "@/hooks/use-local-storage";

interface EzEditCodeEditorProps {
  connection: {
    id: string;
    host: string;
    username: string;
    password: string;
  };
}

export function EzEditCodeEditor({ connection }: EzEditCodeEditorProps) {
  const [selectedFile, setSelectedFile] = useState<{ key: string; isDir: boolean } | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [currentPath, setCurrentPath] = useState<string>("/");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const editorRef = useRef<any>(null);

  // Store panel sizes in localStorage
  const [panelSizes, setPanelSizes] = useLocalStorage('file-explorer-sizes', {
    explorer: 25,
    editor: 75,
  });

  // Mock data
  const mockFiles = [
    { key: "/index.html", size: 1024, modified: new Date(), isDir: false },
    { key: "/css", isDir: true },
    { key: "/js", isDir: true },
    { key: "/images", isDir: true },
    { key: "/about.html", size: 2048, modified: new Date(), isDir: false },
    { key: "/contact.html", size: 1536, modified: new Date(), isDir: false },
  ];

  const handleSelectFile = (file: { key: string; isDir: boolean }) => {
    if (file.isDir) {
      setCurrentPath(file.key);
      return;
    }
    
    setSelectedFile(file);
    setIsLoading(true);
    
    // Simulate loading file content
    setTimeout(() => {
      const mockContent = `<!DOCTYPE html>
<html>
<head>
  <title>${file.key}</title>
</head>
<body>
  <h1>This is mock content for ${file.key}</h1>
  <p>In a real application, this would be loaded from the FTP server.</p>
</body>
</html>`;
      
      setFileContent(mockContent);
      setIsLoading(false);
      setHasUnsavedChanges(false);
    }, 800);
  };

  const handleContentChange = (newContent: string) => {
    setFileContent(newContent);
    setHasUnsavedChanges(true);
  };

  const handleSaveFile = async () => {
    if (!selectedFile) return;
    
    setIsSaving(true);
    
    // Simulate saving file
    console.log(`Saving file ${selectedFile.key}...`);
    console.log(fileContent);
    
    // Add delay to simulate network request
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSaving(false);
    setHasUnsavedChanges(false);
    
    return Promise.resolve();
  };

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
  };

  const handleFormat = () => {
    if (editorRef.current) {
      try {
        editorRef.current.getAction('editor.action.formatDocument')?.run();
      } catch (e) {
        console.error("Error formatting document", e);
      }
    }
  };

  const handleUndo = () => {
    if (editorRef.current) {
      editorRef.current.trigger('keyboard', 'undo');
    }
  };

  const handleRedo = () => {
    if (editorRef.current) {
      editorRef.current.trigger('keyboard', 'redo');
    }
  };

  return (
    <ResizablePanelGroup
      direction="horizontal"
      onLayout={(sizes) => {
        setPanelSizes({
          explorer: sizes[0],
          editor: sizes[1],
        });
      }}
      className="h-full"
    >
      {/* File Explorer Panel */}
      <ResizablePanel defaultSize={panelSizes.explorer} minSize={15}>
        <SimpleFTPFileList
          currentPath={currentPath}
          files={mockFiles}
          onNavigate={handleNavigate}
          onSelectFile={handleSelectFile}
        />
      </ResizablePanel>
      
      <ResizableHandle />
      
      {/* Code Editor Panel */}
      <ResizablePanel defaultSize={panelSizes.editor}>
        <EditorPane
          filePath={selectedFile?.key || null}
          content={fileContent}
          onChange={handleContentChange}
          onSave={handleSaveFile}
          onFormat={handleFormat}
          onUndo={handleUndo}
          onRedo={handleRedo}
          isLoading={isLoading}
          isSaving={isSaving}
          hasUnsavedChanges={hasUnsavedChanges}
          isPremium={true}
        />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
