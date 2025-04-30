
import React from 'react';
import { Loader } from "lucide-react";
import Editor from "@monaco-editor/react";
import { PreviewTab } from './PreviewTab';

interface EditorContentProps {
  isLoading: boolean;
  activeTab: string;
  content: string | undefined;
  filePath: string;
  handleContentChange: (value: string | undefined) => void;
  detectLanguage: () => string;
}

export function EditorContent({
  isLoading,
  activeTab,
  content,
  filePath,
  handleContentChange,
  detectLanguage
}: EditorContentProps) {
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader className="h-6 w-6 animate-spin mr-2" />
        <span>Loading file...</span>
      </div>
    );
  }
  
  if (content === undefined) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <span className="text-red-500">Error: file is empty or failed to load</span>
      </div>
    );
  }
  
  return (
    <div className="flex-1 grid grid-rows-[1fr_auto]">
      <div className="flex flex-col md:flex-row h-full">
        {/* Editor Section */}
        <div className={`${activeTab === 'visual' ? 'hidden md:block' : ''} flex-1 h-full border-r`}>
          <Editor
            height="100%"
            language={detectLanguage()}
            theme="vs-dark"
            value={content}
            onChange={handleContentChange}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: 'on',
              automaticLayout: true,
            }}
          />
        </div>
        
        {/* Preview Section */}
        <div className={`${activeTab === 'code' ? 'hidden md:block' : ''} flex-1 h-full bg-white`}>
          <PreviewTab content={content} fileName={filePath} />
        </div>
      </div>
    </div>
  );
}
