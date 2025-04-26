import { useState, useEffect } from "react";
import { FileCode2 } from "lucide-react";
import { useFileContent } from "@/hooks/use-file-content";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import { LoadingOverlay } from "@/components/editor/LoadingOverlay";
import { CodeEditor } from "@/components/editor/CodeEditor";
import KleinPane from "@/components/KleinPane";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

interface CodeEditorPaneProps {
  connection: {
    id: string;
    host: string;
    port: number;
    username: string;
    password: string;
  } | null;
  filePath: string;
  onContentChange: (content: string) => void;
}

export default function CodeEditorPane({ connection, filePath, onContentChange }: CodeEditorPaneProps) {
  const [language, setLanguage] = useState<string>("javascript");
  const {
    content,
    isLoading,
    isSaving,
    hasUnsavedChanges,
    updateContent,
    saveContent
  } = useFileContent({ connection, filePath });

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    if (filePath) {
      const extension = filePath.split('.').pop()?.toLowerCase();
      switch (extension) {
        case 'js':
        case 'jsx':
          setLanguage('javascript');
          break;
        case 'ts':
        case 'tsx':
          setLanguage('typescript');
          break;
        case 'html':
          setLanguage('html');
          break;
        case 'css':
          setLanguage('css');
          break;
        case 'json':
          setLanguage('json');
          break;
        case 'md':
          setLanguage('markdown');
          break;
        default:
          setLanguage('plaintext');
      }
    }
  }, [filePath]);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      updateContent(value);
      onContentChange(value);
    }
  };

  const handleKleinResponse = (text: string) => {
    if (content) {
      const newContent = content + '\n' + text;
      updateContent(newContent);
      onContentChange(newContent);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <EditorToolbar
        filePath={filePath}
        isSaving={isSaving}
        hasUnsavedChanges={hasUnsavedChanges}
        onSave={saveContent}
      />

      <div className="flex-1 relative overflow-hidden">
        {isLoading ? (
          <LoadingOverlay />
        ) : !filePath ? (
          <div className="flex flex-col items-center justify-center h-full text-ezgray">
            <FileCode2 size={48} className="mb-2" />
            <p>Select a file from the file tree to edit</p>
          </div>
        ) : (
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={70} minSize={40}>
              <CodeEditor
                content={content}
                language={language}
                onChange={handleEditorChange}
              />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={30} minSize={20} className="hidden lg:block">
              <KleinPane 
                filePath={filePath} 
                fileContent={content}
                onApplyResponse={handleKleinResponse}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>
    </div>
  );
}
