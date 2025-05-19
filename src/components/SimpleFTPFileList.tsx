
import { FileListContainer } from "@/components/ftp-explorer/FileListContainer";

interface FileItem {
  name: string;
  size?: number;
  modified?: Date | string | number;
  isDirectory?: boolean;
  type?: string;
}

interface SimpleFTPFileListProps {
  currentPath: string;
  files: FileItem[];
  onNavigate: (newPath: string) => void;
  onSelectFile?: (file: { key: string; isDir: boolean }) => void;
  isLoading: boolean;
  onRefresh?: () => void;
}

export function SimpleFTPFileList({
  currentPath,
  files,
  onNavigate,
  onSelectFile,
  isLoading,
  onRefresh
}: SimpleFTPFileListProps) {
  return (
    <FileListContainer
      currentPath={currentPath}
      files={files}
      onNavigate={onNavigate}
      onSelectFile={onSelectFile}
      isLoading={isLoading}
      onRefresh={onRefresh}
    />
  );
}
