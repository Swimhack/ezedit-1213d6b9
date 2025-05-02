
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  Trash2, 
  RefreshCw, 
  Clock,
  AlertTriangle,
  Info,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { logEvent } from "@/utils/ftp-utils";

export interface LogEntry {
  timestamp: number;
  message: string;
  level: string; // Required field
  source?: string;
  details?: any;
  type?: string; // Optional to handle ConsoleLog compatibility
}

interface LogViewerProps {
  logs: LogEntry[];
  title: string;
  description?: string;
  onClear?: () => void;
  onRefresh?: () => void;
  onDownload?: () => void;
  emptyMessage?: string;
}

export function LogViewer({
  logs = [],
  title,
  description,
  onClear,
  onRefresh,
  onDownload,
  emptyMessage = "No logs available"
}: LogViewerProps) {
  const [filter, setFilter] = useState<string | null>(null);
  
  const getLevelIcon = (level: string) => {
    switch(level.toLowerCase()) {
      case 'error':
        return <AlertCircle className="h-3.5 w-3.5 text-destructive" />;
      case 'warn':
        return <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />;
      case 'info':
        return <Info className="h-3.5 w-3.5 text-blue-500" />;
      case 'success':
        return <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />;
      default:
        return <Clock className="h-3.5 w-3.5 text-gray-500" />;
    }
  };
  
  const handleDownload = () => {
    if (onDownload) {
      onDownload();
      return;
    }
    
    // Default download implementation
    const text = logs.map(log => {
      const date = new Date(log.timestamp).toLocaleString();
      return `[${date}] [${log.level.toUpperCase()}] ${log.source ? `[${log.source}] ` : ''}${log.message}`;
    }).join('\n');
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '_')}_logs_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    logEvent(`Downloaded logs: ${title}`, 'info', 'logs');
  };
  
  const filteredLogs = filter ? logs.filter(log => {
    return log.level.toLowerCase() === filter.toLowerCase() ||
           (log.source && log.source.toLowerCase() === filter.toLowerCase());
  }) : logs;
  
  const sources = Array.from(new Set(logs.map(log => log.source).filter(Boolean)));
  const levels = Array.from(new Set(logs.map(log => log.level)));
  
  return (
    <div className="rounded-md border">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
          <div className="flex items-center gap-2">
            {onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh}>
                <RefreshCw className="h-3.5 w-3.5 mr-1" /> Refresh
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-3.5 w-3.5 mr-1" /> Export
            </Button>
            {onClear && (
              <Button variant="outline" size="sm" onClick={onClear}>
                <Trash2 className="h-3.5 w-3.5 mr-1" /> Clear
              </Button>
            )}
          </div>
        </div>
        
        {(sources.length > 0 || levels.length > 0) && (
          <div className="mt-3">
            <Tabs defaultValue="all" onValueChange={(value) => setFilter(value === "all" ? null : value)}>
              <TabsList className="bg-transparent border">
                <TabsTrigger value="all">All</TabsTrigger>
                {levels.map(level => (
                  <TabsTrigger key={level} value={level}>
                    <div className="flex items-center gap-1">
                      {getLevelIcon(level)}
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </div>
                  </TabsTrigger>
                ))}
                {sources.map(source => (
                  <TabsTrigger key={source} value={source as string}>
                    {source}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        )}
      </div>
      
      <ScrollArea className="h-[500px]">
        {filteredLogs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {filteredLogs.map((log, index) => (
              <div key={`${log.timestamp}-${index}`} className="border-b pb-2 last:border-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {getLevelIcon(log.level)}
                    <Badge variant={log.level === 'error' ? 'destructive' : 'outline'} className="text-xs">
                      {log.level.toUpperCase()}
                    </Badge>
                    {log.source && (
                      <Badge variant="secondary" className="text-xs">
                        {log.source}
                      </Badge>
                    )}
                  </div>
                  <small className="text-xs text-muted-foreground">
                    {new Date(log.timestamp).toLocaleString()}
                  </small>
                </div>
                <div className="text-sm whitespace-pre-wrap break-words">
                  {log.message}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
