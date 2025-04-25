
import { ExternalLink, Check, X, Settings } from "lucide-react";
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
    <Card className="border-ezgray-dark bg-eznavy">
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center">
          <span className="truncate">{connection.server_name}</span>
          <div className="flex items-center space-x-1">
            {testResult === true && (
              <Badge className="bg-green-600">
                <Check size={12} className="mr-1" /> Connected
              </Badge>
            )}
            {testResult === false && (
              <Badge variant="destructive">
                <X size={12} className="mr-1" /> Failed
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-ezgray mb-1">Host: {connection.host}</p>
          {connection.web_url && (
            <p className="text-sm flex items-center">
              <ExternalLink size={14} className="mr-1" />
              <a 
                href={connection.web_url.startsWith('http') ? connection.web_url : `https://${connection.web_url}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-ezblue hover:underline truncate"
              >
                {connection.web_url}
              </a>
            </p>
          )}
        </div>
        <div className="pt-2 flex flex-col space-y-2">
          <Button onClick={onTest} variant="outline" size="sm">
            Test Connection
          </Button>
          <Button 
            onClick={onViewFiles} 
            className="bg-ezblue hover:bg-ezblue/90" 
            size="sm"
          >
            View Files
          </Button>
          <Button
            onClick={onEdit}
            variant="outline"
            size="sm"
            className="border-ezgray-dark hover:bg-eznavy-light"
          >
            <Settings size={14} className="mr-1" />
            Edit Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
