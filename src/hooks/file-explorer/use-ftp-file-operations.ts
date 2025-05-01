
import { useFtpDirectoryOperations } from "./use-ftp-directory-operations";
import { useFtpFileContent } from "./use-ftp-file-content";

/**
 * Combined hook for FTP file operations
 */
export function useFtpFileOperations() {
  const {
    loadDirectory,
    refreshDirectoryFromServer,
    isLoading: isDirectoryLoading,
    error: directoryError,
    setError: setDirectoryError
  } = useFtpDirectoryOperations();
  
  const {
    fetchFileContent,
    isLoading: isFileLoading,
    isSaving,
    error: fileError,
    setError: setFileError,
    setIsLoading
  } = useFtpFileContent();
  
  // Combine the loading states and errors
  const isLoading = isDirectoryLoading || isFileLoading;
  const error = directoryError || fileError;
  
  const setError = (newError: string | null) => {
    setDirectoryError(newError);
    setFileError(newError);
  };
  
  return {
    loadDirectory,
    fetchFileContent,
    refreshDirectoryFromServer,
    isLoading,
    setIsLoading,
    isSaving,
    error,
    setError
  };
}
