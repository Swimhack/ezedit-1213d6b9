
import { Settings, TestTube } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConnectionActionsProps {
  onTest: (e: React.MouseEvent) => void;
  onEdit: (e: React.MouseEvent) => void;
}

export function ConnectionActions({ onTest, onEdit }: ConnectionActionsProps) {
  return (
    <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
      <Button 
        onClick={onTest}
        variant="outline" 
        size="icon"
        className="h-7 w-7"
        title="Test connection"
      >
        <TestTube className="h-4 w-4 text-gray-600" />
      </Button>
      <Button
        onClick={onEdit}
        variant="outline"
        size="icon"
        className="h-7 w-7"
        title="Edit connection"
      >
        <Settings className="h-4 w-4 text-gray-600" />
      </Button>
    </div>
  );
}
