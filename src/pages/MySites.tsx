
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { FTPPageHeader } from "@/components/FTPPageHeader";
import { ConnectionsGrid } from "@/components/ftp-connections/ConnectionsGrid";
import { ConnectionModals } from "@/components/ftp-connections/ConnectionModals";
import { useFTPConnections } from "@/hooks/use-ftp-connections";
import { useFileExplorer } from "@/hooks/use-file-explorer";
import type { FtpConnection } from "@/hooks/use-ftp-connections";

const MySites = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConnection, setEditingConnection] = useState<FtpConnection | null>(null);
  
  const { 
    connections, 
    isLoading: isLoadingConnections, 
    testResults, 
    fetchConnections, 
    handleTestConnection 
  } = useFTPConnections();
  
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
    isSaving,
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

  const handleConnect = () => {
    setEditingConnection(null);
    setIsModalOpen(true);
  };

  const handleEdit = (connection: FtpConnection) => {
    setEditingConnection(connection);
    setIsModalOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="container py-6 space-y-6">
        <FTPPageHeader onConnect={handleConnect} />

        <ConnectionsGrid
          connections={connections}
          isLoadingConnections={isLoadingConnections}
          testResults={testResults}
          onConnect={handleConnect}
          onTest={handleTestConnection}
          onViewFiles={openConnection}
          onEdit={handleEdit}
        />

        <ConnectionModals
          isModalOpen={isModalOpen}
          editingConnection={editingConnection}
          activeConnection={activeConnection}
          showFileBrowser={showFileBrowser}
          showFileEditor={showFileEditor}
          showAIAssistant={showAIAssistant}
          currentPath={currentPath}
          files={files}
          isLoading={isLoading}
          currentFilePath={currentFilePath}
          fileContent={fileContent}
          hasUnsavedChanges={hasUnsavedChanges}
          isSaving={isSaving}
          onCloseModal={() => {
            setIsModalOpen(false);
            setEditingConnection(null);
          }}
          onSaveConnection={handleSaveConnection}
          onLoadDirectory={loadDirectory}
          onSelectFile={selectFile}
          onUpdateContent={updateFileContent}
          onSaveContent={saveFileContent}
          onApplyAIResponse={applyAIResponse}
          setShowFileBrowser={setShowFileBrowser}
          setShowFileEditor={setShowFileEditor}
          setShowAIAssistant={setShowAIAssistant}
        />
      </div>
    </DashboardLayout>
  );
};

export default MySites;
