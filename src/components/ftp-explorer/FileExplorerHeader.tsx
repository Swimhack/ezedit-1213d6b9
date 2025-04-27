
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileExplorerHeaderProps {
  serverName: string;
  onClose: () => void;
}

export const FileExplorerHeader = ({ serverName, onClose }: FileExplorerHeaderProps) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-ezgray-dark flex-shrink-0">
      <h2 className="text-lg font-semibold text-ezwhite">
        {serverName} Files
      </h2>
      <Button variant="outline" size="icon" onClick={onClose}>
        <XCircle className="h-5 w-5" />
        <span className="sr-only">Close</span>
      </Button>
    </div>
  );
};
