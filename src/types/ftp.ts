
export interface FileItem {
  name: string;
  size: number;
  modified: string;
  type: "directory" | "file";
  isDirectory: boolean;
}
