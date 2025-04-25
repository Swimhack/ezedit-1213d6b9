
import { ScrollArea } from "@/components/ui/scroll-area";
import { TreeItem } from "@/components/tree/TreeItem";
import { useFileTree } from "@/hooks/use-file-tree";

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
    <div className="h-full">
      <ScrollArea className="h-[calc(100vh-180px)]">
        {isLoading && treeData.length === 0 ? (
          <div className="flex justify-center items-center h-20">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-ezblue"></div>
          </div>
        ) : (
          <ul className="pl-2 space-y-1">
            {treeData.map((node) => (
              <TreeItem
                key={node.path}
                node={node}
                activeFilePath={activeFilePath}
                onToggle={toggleDirectory}
                onSelectFile={onSelectFile}
              />
            ))}
          </ul>
        )}
      </ScrollArea>
    </div>
  );
}
