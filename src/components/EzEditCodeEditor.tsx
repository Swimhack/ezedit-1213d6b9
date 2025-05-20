
import React, { useState, useEffect } from "react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { FileExplorer } from "@/components/file-explorer/FileExplorer";
import { EditorPane } from "@/components/editor/EditorPane";
import { WysiwygPane } from "@/components/editor/WysiwygPane";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { toast } from "sonner";
import { useSubscription } from "@/hooks/useSubscription";

interface EzEditCodeEditorProps {
  connection: {
    id: string;
    host: string;
    username: string;
    password: string;
  };
}

export function EzEditCodeEditor({ connection }: EzEditCodeEditorProps) {
  // State for selected file and content
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [rightPaneMode, setRightPaneMode] = useState<"preview" | "wysiwyg">("preview");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showRightPane, setShowRightPane] = useState<boolean>(true);

  // Panel sizes with local storage persistence
  const [panelSizes, setPanelSizes] = useLocalStorage("ez-editor-panels", {
    explorer: 20,
    editor: 60,
    preview: 20,
  });
  
  const { isPremium } = useSubscription();
  
  // Handle file selection
  const handleSelectFile = async (filePath: string, isDirectory: boolean) => {
    if (isDirectory) return;
    
    if (hasUnsavedChanges) {
      const confirm = window.confirm("You have unsaved changes. Are you sure you want to switch files?");
      if (!confirm) return;
    }
    
    try {
      setIsLoading(true);
      setSelectedFile(filePath);
      
      // Simulate API call to fetch file content
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock file content based on file extension
      const fileExt = filePath.split('.').pop()?.toLowerCase();
      let mockContent = "";
      
      switch (fileExt) {
        case 'html':
          mockContent = `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>Sample HTML</title>\n</head>\n<body>\n  <h1>Hello from ${filePath}</h1>\n  <p>This is a sample HTML file.</p>\n</body>\n</html>`;
          break;
        case 'css':
          mockContent = `body {\n  font-family: Arial, sans-serif;\n  color: #333;\n}\n\nh1 {\n  color: #0066cc;\n}`;
          break;
        case 'js':
          mockContent = `// Sample JavaScript file\nfunction greet() {\n  console.log("Hello from ${filePath}");\n  return "Hello World!";\n}\n\ngreet();`;
          break;
        case 'php':
          mockContent = `<?php\n// Sample PHP file\nfunction greet() {\n  echo "Hello from ${filePath}";\n}\n\ngreet();\n?>`;
          break;
        default:
          mockContent = `Content of ${filePath}.\nThis is a sample file for demonstration purposes.`;
      }
      
      setFileContent(mockContent);
      setHasUnsavedChanges(false);
      
      // Automatically show WYSIWYG for HTML files
      if (fileExt === 'html' && !showRightPane) {
        setShowRightPane(true);
      }
      
      toast.success(`File ${filePath.split('/').pop()} loaded successfully`);
    } catch (error) {
      console.error("Error loading file:", error);
      toast.error(`Failed to load file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle content change
  const handleContentChange = (newContent: string) => {
    setFileContent(newContent);
    setHasUnsavedChanges(true);
  };
  
  // Handle save
  const handleSave = async () => {
    if (!selectedFile || !isPremium) return;
    
    try {
      setIsSaving(true);
      
      // Simulate API call to save file
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setHasUnsavedChanges(false);
      toast.success(`File ${selectedFile.split('/').pop()} saved successfully`);
    } catch (error) {
      console.error("Error saving file:", error);
      toast.error(`Failed to save file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle panel resize
  const handlePanelResize = (sizes: number[]) => {
    setPanelSizes({
      explorer: sizes[0],
      editor: sizes[1],
      preview: sizes.length > 2 ? sizes[2] : 0,
    });
  };
  
  // Determine if file is HTML
  const isHtmlFile = selectedFile?.toLowerCase().endsWith('.html') || selectedFile?.toLowerCase().endsWith('.htm');
  
  return (
    <ResizablePanelGroup
      direction="horizontal"
      onLayout={handlePanelResize}
      className="h-full border rounded-md overflow-hidden"
    >
      {/* File Explorer Panel */}
      <ResizablePanel 
        defaultSize={panelSizes.explorer} 
        minSize={15} 
        maxSize={30}
        className="border-r bg-white dark:bg-gray-900"
      >
        <FileExplorer 
          connection={connection}
          onSelectFile={handleSelectFile}
          selectedFilePath={selectedFile}
        />
      </ResizablePanel>
      
      <ResizableHandle withHandle />
      
      {/* Editor Panel */}
      <ResizablePanel 
        defaultSize={panelSizes.editor} 
        minSize={30}
        className="bg-white dark:bg-gray-950"
      >
        <EditorPane
          filePath={selectedFile}
          content={fileContent}
          onChange={handleContentChange}
          onSave={handleSave}
          isLoading={isLoading}
          isSaving={isSaving}
          hasUnsavedChanges={hasUnsavedChanges}
          isPremium={isPremium}
        />
      </ResizablePanel>
      
      {/* Optional WYSIWYG/Preview Panel */}
      {showRightPane && isHtmlFile && (
        <>
          <ResizableHandle withHandle />
          
          <ResizablePanel 
            defaultSize={panelSizes.preview} 
            minSize={20}
            className="bg-white dark:bg-gray-900"
          >
            <div className="h-full flex flex-col">
              <div className="border-b p-2 bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
                <Tabs 
                  value={rightPaneMode} 
                  onValueChange={(value) => setRightPaneMode(value as "preview" | "wysiwyg")}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                    <TabsTrigger value="wysiwyg" disabled={!isPremium}>
                      WYSIWYG {!isPremium && "(Premium)"}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              <div className="flex-grow overflow-auto">
                <WysiwygPane
                  content={fileContent}
                  mode={rightPaneMode}
                  onChange={handleContentChange}
                  readOnly={!isPremium}
                />
              </div>
            </div>
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  );
}
