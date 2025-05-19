
import { Button } from "@/components/ui/button";
import { ArrowUp, RefreshCcw } from "lucide-react";

interface FileListActionsProps {
  onNavigateUp: () => void;
  onRefresh?: () => void;
  isRootPath: boolean;
}

export function FileListActions({
  onNavigateUp,
  onRefresh,
  isRootPath
}: FileListActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button 
        variant="ghost"
        size="sm" 
        onClick={onNavigateUp}
        disabled={isRootPath}
        className="px-2"
      >
        <ArrowUp className="h-4 w-4 mr-1" />
        Up
      </Button>
      
      {onRefresh && (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onRefresh}
          className="px-2"
        >
          <RefreshCcw className="h-4 w-4 mr-1" />
          Refresh
        </Button>
      )}
    </div>
  );
}
