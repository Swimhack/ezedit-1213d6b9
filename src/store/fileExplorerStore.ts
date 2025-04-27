
import { create } from 'zustand';
import type { FtpConnection } from '@/hooks/use-ftp-connections';

interface FileExplorerState {
  // Active connection
  activeConnection: FtpConnection | null;
  setActiveConnection: (connection: FtpConnection | null) => void;
  
  // File explorer state
  currentPath: string;
  setCurrentPath: (path: string) => void;
  
  // Currently selected file
  currentFilePath: string;
  setCurrentFilePath: (path: string) => void;
  
  // File content
  fileContent: string;
  setFileContent: (content: string) => void;
  
  // Files in the current directory
  files: any[];
  setFiles: (files: any[]) => void;
  
  // Loading states
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  
  // Has unsaved changes
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (hasUnsavedChanges: boolean) => void;

  // Modal visibility
  showFileBrowser: boolean;
  setShowFileBrowser: (show: boolean) => void;
  
  showFileEditor: boolean;
  setShowFileEditor: (show: boolean) => void;
  
  showAIAssistant: boolean;
  setShowAIAssistant: (show: boolean) => void;

  // Reset store
  resetStore: () => void;
}

const initialState = {
  activeConnection: null,
  currentPath: "/",
  currentFilePath: "",
  fileContent: "",
  files: [],
  isLoading: false,
  hasUnsavedChanges: false,
  showFileBrowser: false,
  showFileEditor: false,
  showAIAssistant: false,
};

export const useFileExplorerStore = create<FileExplorerState>((set) => ({
  ...initialState,

  setActiveConnection: (activeConnection) => set({ activeConnection }),
  setCurrentPath: (currentPath) => set({ currentPath }),
  setCurrentFilePath: (currentFilePath) => set({ currentFilePath }),
  setFileContent: (fileContent) => set({ fileContent }),
  setFiles: (files) => set({ files }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setHasUnsavedChanges: (hasUnsavedChanges) => set({ hasUnsavedChanges }),
  setShowFileBrowser: (showFileBrowser) => set({ showFileBrowser }),
  setShowFileEditor: (showFileEditor) => set({ showFileEditor }),
  setShowAIAssistant: (showAIAssistant) => set({ showAIAssistant }),

  resetStore: () => set(initialState),
}));
