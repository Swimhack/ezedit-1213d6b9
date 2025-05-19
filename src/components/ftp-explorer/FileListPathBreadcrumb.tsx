
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

interface FileListPathBreadcrumbProps {
  currentPath: string;
  onNavigateHome: () => void;
  onNavigatePath: (index: number) => void;
}

export function FileListPathBreadcrumb({
  currentPath,
  onNavigateHome,
  onNavigatePath
}: FileListPathBreadcrumbProps) {
  const pathParts = currentPath.split('/').filter(Boolean);

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <Button 
        variant="ghost" 
        size="sm"
        onClick={onNavigateHome}
        className="px-2"
      >
        <Home className="h-4 w-4 mr-1" />
        Root
      </Button>
      
      {pathParts.map((part, index) => (
        <div key={index} className="flex items-center">
          <span className="mx-1 text-ezgray">/</span>
          <button
            onClick={() => onNavigatePath(index)}
            className="text-ezblue hover:underline truncate max-w-[100px]"
            title={part}
          >
            {part}
          </button>
        </div>
      ))}
    </div>
  );
}
