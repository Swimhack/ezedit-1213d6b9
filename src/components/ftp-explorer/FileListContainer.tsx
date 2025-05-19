
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileListItem } from "./FileListItem";
import { FileListPathBreadcrumb } from "./FileListPathBreadcrumb";
import { FileListActions } from "./FileListActions";

interface FileItem {
  name: string;
  size?: number;
  modified?: Date | string | number;
  isDirectory?: boolean;
  type?: string;
}

interface FileListContainerProps {
  currentPath: string;
  files: FileItem[];
  onNavigate: (newPath: string) => void;
  onSelectFile?: (file: { key: string; isDir: boolean }) => void;
  isLoading: boolean;
  onRefresh?: () => void;
}

export function FileListContainer({
  currentPath,
  files,
  onNavigate,
  onSelectFile,
  isLoading,
  onRefresh
}: FileListContainerProps) {
  const handlePathClick = (index: number) => {
    const pathParts = currentPath.split('/').filter(Boolean);
    const newPath = '/' + pathParts.slice(0, index + 1).join('/') + '/';
    onNavigate(newPath);
  };

  const handleNavigateUp = () => {
    if (currentPath === '/') return;
    
    const parts = currentPath.split('/').filter(Boolean);
    parts.pop();
    const parentPath = parts.length === 0 ? '/' : `/${parts.join('/')}/`;
    onNavigate(parentPath);
  };

  const handleNavigateHome = () => {
    onNavigate('/');
  };

  const handleFileClick = (file: FileItem) => {
    if (file.isDirectory || file.type === "directory") {
      const newPath = currentPath.endsWith('/') 
        ? `${currentPath}${file.name}/`
        : `${currentPath}/${file.name}/`;
      onNavigate(newPath);
    } else if (onSelectFile) {
      const filePath = currentPath.endsWith('/')
        ? `${currentPath}${file.name}`
        : `${currentPath}/${file.name}`;
      onSelectFile({ key: filePath, isDir: false });
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <FileListPathBreadcrumb 
          currentPath={currentPath}
          onNavigateHome={handleNavigateHome}
          onNavigatePath={handlePathClick}
        />
        
        <FileListActions
          onNavigateUp={handleNavigateUp}
          onRefresh={onRefresh}
          isRootPath={currentPath === '/'}
        />
      </div>

      <div className="rounded-md border border-ezgray-dark">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Name</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Modified</TableHead>
              <TableHead>Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-ezblue"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : files.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  No files in this directory
                </TableCell>
              </TableRow>
            ) : (
              files.map((file) => (
                <FileListItem
                  key={file.name}
                  file={file}
                  onClick={() => handleFileClick(file)}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
