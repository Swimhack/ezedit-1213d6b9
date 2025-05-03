
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConnectionBadge } from "./ConnectionBadge";
import { ConnectionActions } from "./ConnectionActions";
import { ConnectionWebUrl } from "./ConnectionWebUrl";
import type { FtpConnection } from "@/hooks/use-ftp-connections";

interface ConnectionCardProps {
  connection: FtpConnection;
  testResult: boolean | undefined;
  onTest: () => void;
  onViewFiles: () => void;
  onEdit: () => void;
}

export function ConnectionCard({ 
  connection, 
  testResult, 
  onTest, 
  onViewFiles,
  onEdit
}: ConnectionCardProps) {
  return (
    <Card 
      className="border-gray-200 bg-white hover:bg-gray-50 transition-colors cursor-pointer relative group"
      onClick={onViewFiles}
    >
      <ConnectionActions 
        onTest={(e) => {
          e.stopPropagation();
          onTest();
        }} 
        onEdit={(e) => {
          e.stopPropagation();
          onEdit();
        }}
      />

      <CardHeader className="pb-2 pt-4">
        <CardTitle className="flex items-center">
          <span className="truncate text-gray-800 pr-20">{connection.server_name}</span>
          <div className="flex items-center ml-auto">
            <ConnectionBadge connected={testResult} />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-gray-600">Host: {connection.host}</p>
        <ConnectionWebUrl 
          url={connection.web_url}
          onClick={(e) => e.stopPropagation()}
        />
      </CardContent>
    </Card>
  );
}
