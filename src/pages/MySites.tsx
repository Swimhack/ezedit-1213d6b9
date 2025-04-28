import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { FTPPageHeader } from "@/components/FTPPageHeader";
import { ConnectionsGrid } from "@/components/ftp-connections/ConnectionsGrid";
import { ConnectionModals } from "@/components/ftp-connections/ConnectionModals";
import { useFTPConnections } from "@/hooks/use-ftp-connections";
import { useFileExplorer } from "@/hooks/use-file-explorer";
import type { FtpConnection } from "@/hooks/use-ftp-connections";
import { SiteCard } from "@/components/SiteCard";
import { SkeletonSiteCard } from "@/components/SkeletonSiteCard";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

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
      <div className="container py-4 md:py-6 space-y-4 md:space-y-6">
        <FTPPageHeader onConnect={handleConnect} />

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {isLoadingConnections ? (
            Array.from({ length: 3 }).map((_, i) => <SkeletonSiteCard key={i} />)
          ) : connections.length === 0 ? (
            <div className="col-span-full text-center py-6 md:py-8 border border-dashed border-gray-300 rounded-lg">
              <h3 className="text-lg md:text-xl font-medium mb-2">No sites connected yet</h3>
              <p className="text-gray-500 mb-4 px-4">
                Add your first FTP connection to start managing your sites
              </p>
              <Button onClick={handleConnect} variant="outline">
                <PlusCircle className="mr-2" size={16} /> Connect a Site
              </Button>
            </div>
          ) : (
            connections.map((connection) => (
              <SiteCard
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
