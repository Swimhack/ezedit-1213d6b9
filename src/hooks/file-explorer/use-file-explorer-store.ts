
import { useFileExplorerStore } from "@/store/fileExplorerStore";

export function useFileExplorerStore() {
  const {
    activeConnection, setActiveConnection,
    currentPath, setCurrentPath,
    currentFilePath, setCurrentFilePath,
    fileContent, setFileContent,
    files, setFiles,
    isLoading, setIsLoading,
    hasUnsavedChanges, setHasUnsavedChanges,
    error, setError,
    showFileBrowser, setShowFileBrowser,
    showFileEditor, setShowFileEditor,
    showAIAssistant, setShowAIAssistant,
  } = useFileExplorerStore(state => state);

  return {
    activeConnection, setActiveConnection,
    currentPath, setCurrentPath,
    currentFilePath, setCurrentFilePath,
    fileContent, setFileContent,
    files, setFiles,
    isLoading, setIsLoading,
    hasUnsavedChanges, setHasUnsavedChanges,
    error, setError,
    showFileBrowser, setShowFileBrowser,
    showFileEditor, setShowFileEditor,
    showAIAssistant, setShowAIAssistant,
  };
}
