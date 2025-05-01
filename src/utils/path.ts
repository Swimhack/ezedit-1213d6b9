
/**
 * Normalize a file path to ensure it has the correct format
 * @param path The path to normalize
 * @returns The normalized path
 */
export function normalizePath(path: string): string {
  // Ensure path starts with a slash
  let normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // Replace multiple consecutive slashes with a single slash
  normalizedPath = normalizedPath.replace(/\/+/g, '/');
  
  // Remove trailing slash if it's not the root path
  if (normalizedPath.length > 1 && normalizedPath.endsWith('/')) {
    normalizedPath = normalizedPath.slice(0, -1);
  }
  
  return normalizedPath;
}

/**
 * Join path segments safely
 * @param paths Path segments to join
 * @returns The joined path
 */
export function joinPath(...paths: string[]): string {
  // Filter out empty path segments
  const filteredPaths = paths.filter(path => path !== '');
  
  // Join with a single slash and normalize the result
  return normalizePath(filteredPaths.join('/'));
}

/**
 * Get parent directory path
 * @param path The current path
 * @returns The parent path
 */
export function getParentPath(path: string): string {
  const normalizedPath = normalizePath(path);
  if (normalizedPath === '/') {
    return '/';
  }
  
  const segments = normalizedPath.split('/').filter(Boolean);
  segments.pop();
  return segments.length === 0 ? '/' : `/${segments.join('/')}`;
}

/**
 * Get the filename from a path
 * @param path The path
 * @returns The filename
 */
export function getFileName(path: string): string {
  const normalizedPath = normalizePath(path);
  const segments = normalizedPath.split('/').filter(Boolean);
  return segments.length > 0 ? segments[segments.length - 1] : '';
}

/**
 * Get file extension from a path
 * @param path The path
 * @returns The file extension (without the dot)
 */
export function getFileExtension(path: string): string {
  const fileName = getFileName(path);
  const parts = fileName.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
}

/**
 * Check if path is a specific file type based on extension
 * @param path The file path
 * @param extensions Array of file extensions to check against
 * @returns True if the file has one of the specified extensions
 */
export function isFileType(path: string, extensions: string[]): boolean {
  const extension = getFileExtension(path);
  return extensions.includes(extension.toLowerCase());
}
