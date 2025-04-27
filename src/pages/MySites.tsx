
import { useState } from "react";
import { PlusCircle } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import FTPConnectionModal from "@/components/FTPConnectionModal";
import { Button } from "@/components/ui/button";
import { FTPConnectionCard } from "@/components/FTPConnectionCard";
import { FTPPageHeader } from "@/components/FTPPageHeader";
import { useFTPConnections } from "@/hooks/use-ftp-connections";
import { useFileContent } from "@/hooks/use-file-content";
import { FileBrowserModal } from "@/components/ftp-explorer/FileBrowserModal";
import { FileEditorModal } from "@/components/ftp-explorer/FileEditorModal";
import { AIAssistantModal } from "@/components/ftp-explorer/AIAssistantModal";
import type { FtpConnection } from "@/hooks/use-ftp-connections";
import { listDirectory } from "@/lib/ftp";
import { toast } from "sonner";
import { normalizePath } from "@/utils/path";

const MySites = () => {
  // Connection state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConnection, setEditingConnection] = useState<FtpConnection | null>(null);
  const [activeConnection, setActiveConnection] = useState<FtpConnection | null>(null);
  
  // File explorer state
  const [currentPath, setCurrentPath] = useState("/");
  const [currentFilePath, setCurrentFilePath] = useState("");
  const [files, setFiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Modal visibility state
  const [showFileBrowser, setShowFileBrowser] = useState(false);
  const [showFileEditor, setShowFileEditor] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  const { connections, isLoading: isLoadingConnections, testResults, fetchConnections, handleTestConnection } = useFTPConnections();
  const { content: fileContent, isLoading: isFileLoading, updateContent, saveContent, isSaving, hasUnsavedChanges } = useFileContent({
    connection: activeConnection,
    filePath: currentFilePath
  });

  const handleSaveConnection = () => {
    fetchConnections();
    setIsModalOpen(false);
    setEditingConnection(null);
  };

  const loadDirectory = async (path: string) => {
    if (!activeConnection) return;
    
    setIsLoading(true);
    try {
      const normalizedPath = normalizePath(path);
      const files = await listDirectory(activeConnection, normalizedPath);
      setFiles(files);
      setCurrentPath(normalizedPath);
    } catch (error: any) {
      console.error("[FTPFileExplorer] Directory loading error:", error);
      toast.error(`Failed to load directory: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenFileExplorer = (connection: FtpConnection) => {
    setActiveConnection(connection);
    const startPath = connection.root_directory ? normalizePath(connection.root_directory) : "/";
    loadDirectory(startPath);
    setShowFileBrowser(true);
  };

  const handleSelectFile = async (file: { key: string; isDir: boolean }) => {
    if (!file.isDir) {
      setCurrentFilePath(file.key);
      setShowFileBrowser(false);
      setShowFileEditor(true);
    } else {
      loadDirectory(file.key);
    }
  };

  const handleApplyResponse = (text: string) => {
    if (fileContent) {
      const newContent = fileContent + '\n' + text;
      updateContent(newContent);
    }
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
                onViewFiles={() => handleOpenFileExplorer(connection)}
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
              onSelectFile={handleSelectFile}
            />

            <FileEditorModal
              isOpen={showFileEditor}
              onClose={() => setShowFileEditor(false)}
              fileName={currentFilePath}
              content={fileContent || ""}
              onSave={saveContent}
              isSaving={isSaving}
              hasUnsavedChanges={hasUnsavedChanges}
              onContentChange={updateContent}
            />

            <AIAssistantModal
              isOpen={showAIAssistant}
              onClose={() => setShowAIAssistant(false)}
              filePath={currentFilePath}
              fileContent={fileContent || ""}
              onApplyResponse={handleApplyResponse}
            />

            {showFileEditor && (
              <div className="fixed bottom-4 right-4 space-x-2">
                <Button
                  onClick={() => setShowFileBrowser(true)}
                  variant="outline"
                >
                  Browse Files
                </Button>
                <Button
                  onClick={() => setShowAIAssistant(true)}
                  className="bg-ezblue hover:bg-ezblue/90"
                >
                  AI Assistant
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
