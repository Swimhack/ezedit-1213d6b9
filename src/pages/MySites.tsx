
import { useState } from "react";
import { PlusCircle } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import FTPConnectionModal from "@/components/FTPConnectionModal";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import FTPFileExplorer from "@/components/FTPFileExplorer";
import { FTPConnectionCard } from "@/components/FTPConnectionCard";
import { FTPPageHeader } from "@/components/FTPPageHeader";
import { useFTPConnections } from "@/hooks/use-ftp-connections";
import type { FtpConnection } from "@/hooks/use-ftp-connections";

const MySites = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConnection, setEditingConnection] = useState<FtpConnection | null>(null);
  const [activeConnection, setActiveConnection] = useState<FtpConnection | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { connections, isLoading, testResults, fetchConnections, handleTestConnection } = useFTPConnections();

  const handleSaveConnection = () => {
    fetchConnections();
    setIsModalOpen(false);
    setEditingConnection(null);
  };

  const handleOpenFileExplorer = (connection: FtpConnection) => {
    setActiveConnection(connection);
    setIsDrawerOpen(true);
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
          {isLoading ? (
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

        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          {activeConnection && (
            <FTPFileExplorer 
              connection={activeConnection} 
              onClose={() => setIsDrawerOpen(false)}
            />
          )}
        </Drawer>
      </div>
    </DashboardLayout>
  );
};

export default MySites;
