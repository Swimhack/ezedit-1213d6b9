
import { useState } from "react";
import { PlusCircle } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import FTPConnectionModal from "@/components/FTPConnectionModal";
import { Button } from "@/components/ui/button";
import { FTPConnectionCard } from "@/components/FTPConnectionCard";
import { FTPPageHeader } from "@/components/FTPPageHeader";
import { useFTPConnections } from "@/hooks/use-ftp-connections";
import { FileBrowserModal } from "@/components/ftp-explorer/FileBrowserModal";
import { FileEditorModal } from "@/components/ftp-explorer/FileEditorModal";
import { AIAssistantModal } from "@/components/ftp-explorer/AIAssistantModal";
import type { FtpConnection } from "@/hooks/use-ftp-connections";
import { useFileExplorer } from "@/hooks/use-file-explorer";

const MySites = () => {
  // Connection form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConnection, setEditingConnection] = useState<FtpConnection | null>(null);
  
  // FTP connections hook
  const { connections, isLoading: isLoadingConnections, testResults, fetchConnections, handleTestConnection } = useFTPConnections();
  
  // File explorer state and functions
  const {
    activeConnection,
    showFileBrowser, 
    showFileEditor, 
    showAIAssistant,
    setShowFileBrowser,
    setShowFileEditor,
    setShowAIAssistant,
    currentPath,
    files,
    isLoading,
    currentFilePath,
    fileContent,
    hasUnsavedChanges,
    isSaving: isFileContentLoading,
    loadDirectory,
    selectFile,
    updateFileContent,
    saveFileContent,
    openConnection,
    applyAIResponse
  } = useFileExplorer();

  const handleSaveConnection = () => {
    fetchConnections();
    setIsModalOpen(false);
    setEditingConnection(null);
  };

  const handleEdit = (connection: FtpConnection) => {
    setEditingConnection(connection);
    setIsModalOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="container py-6 space-y-6">
        <FTPPageHeader onConnect={() => {
          setEditingConnection(null);
          setIsModalOpen(true);
        }} />

        <FTPConnectionModal 
          isOpen={isModalOpen} 
          onClose={() => {
            setIsModalOpen(false);
            setEditingConnection(null);
          }} 
          onSave={handleSaveConnection}
          editConnection={editingConnection}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoadingConnections ? (
            <div className="col-span-full text-center py-8">
              <div className="animate-pulse">Loading connections...</div>
            </div>
          ) : connections.length === 0 ? (
            <div className="col-span-full text-center py-8 border border-dashed border-ezgray-dark rounded-lg">
              <h3 className="text-xl font-medium mb-2">No sites connected yet</h3>
              <p className="text-ezgray mb-4">
                Add your first FTP connection to start managing your sites
              </p>
              <Button onClick={() => setIsModalOpen(true)} variant="outline">
                <PlusCircle className="mr-2" size={16} /> Connect a Site
              </Button>
            </div>
          ) : (
            connections.map((connection) => (
              <FTPConnectionCard
                key={connection.id}
                connection={connection}
                testResult={testResults[connection.id]}
                onTest={() => handleTestConnection(connection)}
                onViewFiles={() => openConnection(connection)}
                onEdit={() => handleEdit(connection)}
              />
            ))
          )}
        </div>

        {activeConnection && (
          <>
            <FileBrowserModal
              isOpen={showFileBrowser}
              onClose={() => setShowFileBrowser(false)}
              currentPath={currentPath}
              files={files}
              isLoading={isLoading}
              serverName={activeConnection.server_name}
              onNavigate={loadDirectory}
              onSelectFile={selectFile}
            />

            <FileEditorModal
              isOpen={showFileEditor}
              onClose={() => setShowFileEditor(false)}
              fileName={currentFilePath}
              content={fileContent || ""}
              onSave={saveFileContent}
              isSaving={isFileContentLoading}
              hasUnsavedChanges={hasUnsavedChanges}
              onContentChange={updateFileContent}
            />

            <AIAssistantModal
              isOpen={showAIAssistant}
              onClose={() => setShowAIAssistant(false)}
              filePath={currentFilePath}
              fileContent={fileContent || ""}
              onApplyResponse={applyAIResponse}
            />

            {/* Floating button controls when any modal is open */}
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
      </div>
    </DashboardLayout>
  );
};

export default MySites;
