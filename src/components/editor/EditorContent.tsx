
import React from "react";
import { FileEditorContent } from "@/components/ftp-explorer/FileEditorContent";
import { EditorPreviewSplit } from "@/components/editor/EditorPreviewSplit";

interface EditorContentProps {
  isLoading: boolean;
  activeTab: string;
  content: string | null;
  filePath: string;
  handleContentChange: (content: string) => void;
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
  // For HTML files, we offer a split view with preview
  const isHtmlFile = /\.(html?|htm|php)$/i.test(filePath);
  
  if (activeTab === "split" && isHtmlFile) {
    return (
      <EditorPreviewSplit
        code={content || ""}
        filePath={filePath}
        onCodeChange={(content) => content && handleContentChange(content)}
        detectLanguage={detectLanguage}
        editorMode={'code'}
        editorContentReady={!isLoading && !!content}
      />
    );
  }

  if (activeTab === "visual" && isHtmlFile) {
    return (
      <EditorPreviewSplit
        code={content || ""}
        filePath={filePath}
        onCodeChange={(content) => content && handleContentChange(content)}
        detectLanguage={detectLanguage}
        editorMode={'wysiwyg'}
        editorContentReady={!isLoading && !!content}
      />
    );
  }

  // Default view for all other tabs/file types
  return (
    <FileEditorContent
      filePath={filePath}
      content={content}
      onContentChange={handleContentChange}
      readOnly={false}
      isLoading={isLoading}
    />
  );
}
