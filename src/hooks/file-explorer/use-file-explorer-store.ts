
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

  // Error state
  error: string | null;
  setError: (error: string | null) => void;

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

// Define the file tree cache state interface
interface FileTreeCacheState {
  cache: Record<string, Record<string, any[]>>;
  cacheTreeData: (connectionId: string, path: string, data: any[]) => void;
  getCachedTreeData: (connectionId: string, path: string) => any[] | null;
  clearCache: (connectionId?: string) => void;
}

const initialState = {
  activeConnection: null,
  currentPath: "/",
  currentFilePath: "",
  fileContent: "",
  files: [],
  isLoading: false,
  hasUnsavedChanges: false,
  error: null,
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
  setError: (error) => set({ error }),
  setShowFileBrowser: (showFileBrowser) => set({ showFileBrowser }),
  setShowFileEditor: (showFileEditor) => set({ showFileEditor }),
  setShowAIAssistant: (showAIAssistant) => set({ showAIAssistant }),

  resetStore: () => set(initialState),
}));

// Create and export the file tree cache store
export const useFileTreeCache = create<FileTreeCacheState>((set, get) => ({
  cache: {},
  
  cacheTreeData: (connectionId, path, data) => set(state => {
    const newCache = { ...state.cache };
    if (!newCache[connectionId]) {
      newCache[connectionId] = {};
    }
    newCache[connectionId][path] = data;
    return { cache: newCache };
  }),
  
  getCachedTreeData: (connectionId, path) => {
    const cache = get().cache;
    return cache[connectionId]?.[path] || null;
  },
  
  clearCache: (connectionId) => set(state => {
    if (connectionId) {
      const newCache = { ...state.cache };
      delete newCache[connectionId];
      return { cache: newCache };
    }
    return { cache: {} };
  })
}));
