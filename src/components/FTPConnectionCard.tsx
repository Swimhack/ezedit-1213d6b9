
import { ExternalLink, Settings, TestTube } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FtpConnection } from "@/hooks/use-ftp-connections";

interface FTPConnectionCardProps {
  connection: FtpConnection;
  testResult: boolean | undefined;
  onTest: () => void;
  onViewFiles: () => void;
  onEdit: () => void;
}

export function FTPConnectionCard({ 
  connection, 
  testResult, 
  onTest, 
  onViewFiles,
  onEdit
}: FTPConnectionCardProps) {
  return (
    <Card 
      className="border-gray-200 bg-white hover:bg-gray-50 transition-colors cursor-pointer relative group"
      onClick={onViewFiles}
    >
      <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
        <Button 
          onClick={(e) => {
            e.stopPropagation();
            onTest();
          }} 
          variant="outline" 
          size="icon"
          className="h-7 w-7"
          title="Test connection"
        >
          <TestTube className="h-4 w-4 text-gray-600" />
        </Button>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          variant="outline"
          size="icon"
          className="h-7 w-7"
          title="Edit connection"
        >
          <Settings className="h-4 w-4 text-gray-600" />
        </Button>
      </div>

      <CardHeader className="pb-2 pt-2">
        <CardTitle className="flex items-center">
          <span className="truncate text-gray-800 pr-20">{connection.server_name}</span>
          <div className="flex items-center ml-auto">
            {testResult === true && (
              <Badge className="bg-green-500">
                Connected
              </Badge>
            )}
            {testResult === false && (
              <Badge variant="destructive">
                Failed
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-gray-600">Host: {connection.host}</p>
        {connection.web_url && (
          <p className="text-sm flex items-center gap-1 truncate">
            <ExternalLink size={14} className="shrink-0 text-gray-500" />
            <a 
              href={connection.web_url.startsWith('http') ? connection.web_url : `https://${connection.web_url}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline truncate"
              onClick={(e) => e.stopPropagation()}
            >
              {connection.web_url}
            </a>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
