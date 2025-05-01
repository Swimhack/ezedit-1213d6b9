
import { ScrollArea } from "@/components/ui/scroll-area";
import { TreeItem } from "@/components/tree/TreeItem";
import { useFileTree } from "@/hooks/use-file-tree";
import { Loader } from "lucide-react";

interface FileTreeProps {
  connection: {
    id: string;
    server_name: string;
    host: string;
    port: number;
    username: string;
    password: string;
  };
  onSelectFile: (path: string) => void;
  activeFilePath?: string;
}

export default function FileTree({ connection, onSelectFile, activeFilePath }: FileTreeProps) {
  const { treeData, isLoading, toggleDirectory } = useFileTree({ connection });

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1 overflow-y-auto">
        <div className="pr-2">
          {isLoading ? (
            <div className="flex justify-center items-center h-20">
              <Loader className="h-6 w-6 animate-spin text-ezblue" />
            </div>
          ) : treeData.length === 0 ? (
            <div className="text-center py-6 text-ezgray">
              No files found
            </div>
          ) : (
            <ul className="pl-2 space-y-1 max-h-full">
              {treeData.map((node) => (
                <TreeItem
                  key={node.path}
                  node={node}
                  activeFilePath={activeFilePath}
                  onToggle={() => toggleDirectory(node.path)}
                  onSelectFile={onSelectFile}
                />
              ))}
            </ul>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
