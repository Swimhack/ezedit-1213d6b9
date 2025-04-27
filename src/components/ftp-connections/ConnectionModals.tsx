
import FTPConnectionModal from "@/components/FTPConnectionModal";
import { FileBrowserModal } from "@/components/ftp-explorer/FileBrowserModal";
import { FileEditorModal } from "@/components/ftp-explorer/FileEditorModal";
import { AIAssistantModal } from "@/components/ftp-explorer/AIAssistantModal";
import { Button } from "@/components/ui/button";
import type { FtpConnection } from "@/hooks/use-ftp-connections";

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
  onLoadDirectory: (path: string) => void;
  onSelectFile: (file: { key: string; isDir: boolean }) => Promise<void>;
  onUpdateContent: (content: string) => void;
  onSaveContent: () => void;
  onApplyAIResponse: (text: string) => void;
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
  setShowAIAssistant,
}: ConnectionModalsProps) {
  return (
    <>
      <FTPConnectionModal 
        isOpen={isModalOpen} 
        onClose={onCloseModal} 
        onSave={onSaveConnection}
        editConnection={editingConnection}
      />

      {activeConnection && (
        <>
          <FileBrowserModal
            isOpen={showFileBrowser}
            onClose={() => setShowFileBrowser(false)}
            currentPath={currentPath}
            files={files}
            isLoading={isLoading}
            serverName={activeConnection.server_name}
            onNavigate={onLoadDirectory}
            onSelectFile={onSelectFile}
          />

          <FileEditorModal
            isOpen={showFileEditor}
            onClose={() => setShowFileEditor(false)}
            fileName={currentFilePath}
            content={fileContent}
            onSave={onSaveContent}
            isSaving={isSaving}
            hasUnsavedChanges={hasUnsavedChanges}
            onContentChange={onUpdateContent}
          />

          <AIAssistantModal
            isOpen={showAIAssistant}
            onClose={() => setShowAIAssistant(false)}
            filePath={currentFilePath}
            fileContent={fileContent}
            onApplyResponse={onApplyAIResponse}
          />

          {(showFileEditor || showFileBrowser || showAIAssistant) && (
            <div className="fixed bottom-4 right-4 space-x-2">
              <Button
                onClick={() => setShowFileBrowser(!showFileBrowser)}
                variant={showFileBrowser ? "default" : "outline"}
                className={showFileBrowser ? "bg-ezblue hover:bg-ezblue/90" : ""}
              >
                Files
              </Button>
              <Button
                onClick={() => setShowFileEditor(!showFileEditor)}
                variant={showFileEditor ? "default" : "outline"}
                className={showFileEditor ? "bg-ezblue hover:bg-ezblue/90" : ""}
                disabled={!currentFilePath}
              >
                Editor
              </Button>
              <Button
                onClick={() => setShowAIAssistant(!showAIAssistant)}
                variant={showAIAssistant ? "default" : "outline"}
                className={showAIAssistant ? "bg-ezblue hover:bg-ezblue/90" : ""}
                disabled={!currentFilePath}
              >
                AI
              </Button>
            </div>
          )}
        </>
      )}
    </>
  );
}
