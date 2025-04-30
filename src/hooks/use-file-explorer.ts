
import { useState } from "react";
import { useFtpFileOperations } from "./file-explorer/use-ftp-file-operations";
import { useFileSave } from "./file-explorer/use-file-save";
import { useAiIntegration } from "./file-explorer/use-ai-integration";
import { useFileExplorerStore } from "./file-explorer/use-file-explorer-store";
import type { FtpConnection } from "@/hooks/use-ftp-connections";

export function useFileExplorer() {
  // Get all the store values and setters
  const {
    activeConnection, setActiveConnection,
    currentPath, setCurrentPath,
    currentFilePath, setCurrentFilePath,
    fileContent, setFileContent,
    files, setFiles,
    hasUnsavedChanges, setHasUnsavedChanges,
    error, setError,
    showFileBrowser, setShowFileBrowser,
    showFileEditor, setShowFileEditor,
    showAIAssistant, setShowAIAssistant,
  } = useFileExplorerStore();

  // Initialize the specialized hooks
  const { loadDirectory: ftpLoadDirectory, fetchFileContent, isLoading, setIsLoading } = useFtpFileOperations();
  const { isSaving, saveFileContent } = useFileSave();
  const { applyAIResponse } = useAiIntegration();

  const loadDirectory = async (path: string) => {
    if (!activeConnection) return;
    
    setIsLoading(true);
    try {
      const result = await ftpLoadDirectory(activeConnection.id, path);
      if (result) {
        setFiles(result.files);
        setCurrentPath(result.path);
      }
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  const selectFile = async (file: { key: string; isDir: boolean }): Promise<void> => {
    if (file.isDir) {
      return loadDirectory(file.key);
    } else {
      setCurrentFilePath(file.key);
      if (activeConnection) {
        return fetchFileContent(activeConnection.id, file.key)
          .then(content => {
            setFileContent(content);
            setHasUnsavedChanges(false);
            return Promise.resolve();
          })
          .catch(() => {
            setFileContent("");
            setHasUnsavedChanges(false);
            return Promise.resolve();
          });
      }
      return Promise.resolve();
    }
  };

  const updateFileContent = (newContent: string) => {
    setFileContent(newContent);
    setHasUnsavedChanges(true);
  };

  const saveFile = async () => {
    if (!activeConnection || !currentFilePath) return false;
    
    const success = await saveFileContent(activeConnection.id, currentFilePath, fileContent);
    if (success) {
      setHasUnsavedChanges(false);
    }
    return success;
  };

  const openConnection = async (connection: FtpConnection) => {
    setActiveConnection(connection);
    setShowFileBrowser(true);
  };

  const applyAiResponse = (text: string) => {
    const newContent = applyAIResponse(fileContent, text);
    updateFileContent(newContent);
  };

  return {
    // State
    activeConnection,
    currentPath,
    currentFilePath,
    fileContent,
    files,
    isLoading,
    isSaving,
    hasUnsavedChanges,
    error,
    showFileBrowser,
    showFileEditor,
    showAIAssistant,
    
    // Actions
    setShowFileBrowser,
    setShowFileEditor,
    setShowAIAssistant,
    loadDirectory,
    selectFile,
    updateFileContent,
    saveFileContent: saveFile,
    openConnection,
    applyAIResponse: applyAiResponse,
  };
}
