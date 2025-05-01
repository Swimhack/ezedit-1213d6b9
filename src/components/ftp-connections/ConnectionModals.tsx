import { useState } from "react";
import { FTPConnectionModal } from "@/components/FTPConnectionModal";
import { FileBrowserModal } from "@/components/ftp-explorer/FileBrowserModal";
import { FileEditorModal } from "@/components/ftp-explorer/FileEditorModal";
import { AIAssistantModal } from "@/components/ftp-explorer/AIAssistantModal";
import { FtpConnection } from "@/hooks/use-ftp-connections";

// Keep the same interface, just showing relevant parts
interface ConnectionModalsProps {
  isModalOpen: boolean;
  editingConnection: FtpConnection | null;
  activeConnection: FtpConnection | null;
  showFileBrowser: boolean;
  showFileEditor: boolean;
  showAIAssistant: boolean;
  currentPath: string;
  files: any[];
  isLoading: boolean;
  currentFilePath: string;
  fileContent: string;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  onCloseModal: () => void;
  onSaveConnection: () => void;
  onLoadDirectory: (connectionId: string, path: string) => Promise<any>;
  onSelectFile: (file: any) => void;
  onUpdateContent: (content: string) => void;
  onSaveContent: () => Promise<void>;
  onApplyAIResponse: (content: string) => void;
  setShowFileBrowser: (show: boolean) => void;
  setShowFileEditor: (show: boolean) => void;
  setShowAIAssistant: (show: boolean) => void;
}

export function ConnectionModals({
  isModalOpen,
  editingConnection,
  activeConnection,
  showFileBrowser,
  showFileEditor,
  showAIAssistant,
  currentPath,
  files,
  isLoading,
  currentFilePath,
  fileContent,
  hasUnsavedChanges,
  isSaving,
  onCloseModal,
  onSaveConnection,
  onLoadDirectory,
  onSelectFile,
  onUpdateContent,
  onSaveContent,
  onApplyAIResponse,
  setShowFileBrowser,
  setShowFileEditor,
  setShowAIAssistant
}: ConnectionModalsProps) {
  const handleSelectFile = (file: { key: string; isDir: boolean }) => {
    if (file.isDir) {
      return; // Don't do anything for directories
    }
    
    onSelectFile(file);
    setShowFileBrowser(false);
    setShowFileEditor(true);
  };

  return (
    <>
      {/* FTP Connection Modal */}
      <FTPConnectionModal
        isOpen={isModalOpen}
        editingConnection={editingConnection}
        onClose={onCloseModal}
        onSave={onSaveConnection}
      />

      {/* File Browser Modal */}
      <FileBrowserModal
        isOpen={showFileBrowser}
        connection={activeConnection}
        onClose={() => setShowFileBrowser(false)}
        onSelectFile={handleSelectFile}
        title="File Browser"
      />

      {/* File Editor Modal */}
      <FileEditorModal
        isOpen={showFileEditor}
        filePath={currentFilePath}
        content={fileContent}
        onClose={() => {
          if (hasUnsavedChanges) {
            if (window.confirm("You have unsaved changes. Discard changes?")) {
              setShowFileEditor(false);
            }
          } else {
            setShowFileEditor(false);
          }
        }}
        onContentChange={onUpdateContent}
        onSave={onSaveContent}
        hasUnsavedChanges={hasUnsavedChanges}
        isSaving={isSaving}
        onOpenAIAssistant={() => {
          setShowFileEditor(false);
          setShowAIAssistant(true);
        }}
      />

      {/* AI Assistant Modal */}
      <AIAssistantModal
        isOpen={showAIAssistant}
        filePath={currentFilePath}
        content={fileContent}
        onClose={() => setShowAIAssistant(false)}
        onApplyResponse={onApplyAIResponse}
        onBack={() => {
          setShowAIAssistant(false);
          setShowFileEditor(true);
        }}
      />
    </>
  );
}
