
import React, { useRef, useState, useEffect } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Loader, FileCode2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditorPaneProps {
  filePath: string | null;
  content: string;
  onChange: (content: string) => void;
  onSave: () => Promise<void>;
  onFormat: () => void;
  onUndo: () => void;
  onRedo: () => void;
  isLoading: boolean;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  isPremium: boolean;
}

export function EditorPane({
  filePath,
  content,
  onChange,
  onSave,
  onFormat,
  onUndo,
  onRedo,
  isLoading,
  isSaving,
  hasUnsavedChanges,
  isPremium
}: EditorPaneProps) {
  const editorRef = useRef<any>(null);
  const [language, setLanguage] = useState<string>("plaintext");
  const [showPreview, setShowPreview] = useState<boolean>(false);
  
  // Determine language based on file extension
  useEffect(() => {
    if (filePath) {
      const extension = filePath.split('.').pop()?.toLowerCase();
      switch (extension) {
        case 'html': case 'htm':
          setLanguage('html');
          setShowPreview(true);
          break;
        case 'js': case 'jsx':
          setLanguage('javascript');
          setShowPreview(false);
          break;
        case 'ts': case 'tsx':
          setLanguage('typescript');
          setShowPreview(false);
          break;
        case 'css':
          setLanguage('css');
          setShowPreview(false);
          break;
        case 'php':
          setLanguage('php');
          setShowPreview(false);
          break;
        case 'json':
          setLanguage('json');
          setShowPreview(false);
          break;
        case 'md':
          setLanguage('markdown');
          setShowPreview(true);
          break;
        default:
          setLanguage('plaintext');
          setShowPreview(false);
      }
    }
  }, [filePath]);

  return (
    <div className="h-full flex flex-col">
      <EditorToolbar 
        filePath={filePath}
        onSave={onSave}
        onFormat={onFormat}
        onUndo={onUndo}
        onRedo={onRedo}
        isSaving={isSaving}
        hasUnsavedChanges={hasUnsavedChanges}
        isPremium={isPremium}
      />
      
      <div className="flex-grow relative overflow-hidden">
        {!isPremium && (
          <div className="absolute top-0 left-0 right-0 z-10 bg-yellow-50 border-b border-yellow-200 p-2 text-sm text-yellow-800 flex items-center justify-center">
            <span>Preview Mode - Premium required to save changes</span>
          </div>
        )}
        
        {!filePath ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <FileCode2 size={48} className="mb-4" />
            <p>Select a file from the explorer to edit</p>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Loader className="h-8 w-8 animate-spin text-blue-500 mb-4" />
            <p>Loading file content...</p>
          </div>
        ) : (
          <div className={cn("h-full", !isPremium && "pt-10")}>
            <CodeEditor
              content={content}
              language={language}
              onChange={onChange}
              editorRef={editorRef}
              readOnly={!isPremium}
            />
          </div>
        )}
      </div>
    </div>
  );
}
