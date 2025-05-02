
import { ExternalLink, Settings, TestTube } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FTPSite } from "@/hooks/use-ftp-sites";

interface SiteCardProps {
  site: FTPSite;
  testResult: boolean | undefined;
  onTest: () => void;
  onViewFiles: () => void;
  onEdit: () => void;
}

export function SiteCard({ 
  site, 
  testResult, 
  onTest, 
  onViewFiles,
  onEdit
}: SiteCardProps) {
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
          title="Edit site"
        >
          <Settings className="h-4 w-4 text-gray-600" />
        </Button>
      </div>

      <CardHeader className="pb-2 pt-4">
        <CardTitle className="flex items-center">
          <span className="truncate text-gray-800 pr-20">
            {site.site_name || site.server_url}
          </span>
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
        <p className="text-sm text-gray-600">Server: {site.server_url}</p>
        <p className="text-sm text-gray-500">Username: {site.username}</p>
        <div className="flex items-center justify-between mt-4">
          <Button 
            variant="ghost" 
            size="sm"
            className="text-blue-600 p-0 h-auto hover:text-blue-800 hover:bg-transparent"
            onClick={(e) => {
              e.stopPropagation();
              onViewFiles();
            }}
          >
            <ExternalLink size={14} className="mr-1" />
            View files
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
