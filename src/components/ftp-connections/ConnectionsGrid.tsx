
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { FTPConnectionCard } from "@/components/FTPConnectionCard";
import type { FtpConnection } from "@/hooks/use-ftp-connections";

interface ConnectionsGridProps {
  connections: FtpConnection[];
  isLoadingConnections: boolean;
  testResults: Record<string, boolean>;
  onConnect: () => void;
  onTest: (connection: FtpConnection) => void;
  onViewFiles: (connection: FtpConnection) => void;
  onEdit: (connection: FtpConnection) => void;
}

export function ConnectionsGrid({
  connections,
  isLoadingConnections,
  testResults,
  onConnect,
  onTest,
  onViewFiles,
  onEdit,
}: ConnectionsGridProps) {
  if (isLoadingConnections) {
    return (
      <div className="col-span-full text-center py-8">
        <div className="animate-pulse">Loading connections...</div>
      </div>
    );
  }

  if (connections.length === 0) {
    return (
      <div className="col-span-full text-center py-8 border border-dashed border-ezgray-dark rounded-lg">
        <h3 className="text-xl font-medium mb-2">No sites connected yet</h3>
        <p className="text-ezgray mb-4">
          Add your first FTP connection to start managing your sites
        </p>
        <Button onClick={onConnect} variant="outline">
          <PlusCircle className="mr-2" size={16} /> Connect a Site
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {connections.map((connection) => (
        <FTPConnectionCard
          key={connection.id}
          connection={connection}
          testResult={testResults[connection.id]}
          onTest={() => onTest(connection)}
          onViewFiles={() => onViewFiles(connection)}
          onEdit={() => onEdit(connection)}
        />
      ))}
    </div>
  );
}
