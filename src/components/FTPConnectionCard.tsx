
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
    <Card 
      className="border-ezgray-dark bg-eznavy hover:bg-eznavy-light transition-colors cursor-pointer relative"
      onClick={onViewFiles}
    >
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
                onClick={(e) => e.stopPropagation()}
              >
                {connection.web_url}
              </a>
            </p>
          )}
        </div>
        <div className="absolute top-2 right-2 flex gap-2">
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              onTest();
            }} 
            variant="outline" 
            size="sm"
            className="border-ezgray-dark hover:bg-eznavy-light px-2 h-7"
          >
            Test
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            variant="outline"
            size="sm"
            className="border-ezgray-dark hover:bg-eznavy-light px-2 h-7"
          >
            <Settings size={14} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
