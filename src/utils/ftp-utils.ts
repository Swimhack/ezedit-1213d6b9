
/**
 * Helper utilities for FTP operations
 */

/**
 * Add delay between operations for retrying failed requests
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Create standardized error message for FTP connection failures
 */
export const createConnectionErrorMessage = (error: Error | string): string => {
  const message = typeof error === 'string' ? error : error.message;
  return `Live server connection failed. Please retry Refresh Files or check your Site settings. (${message})`;
};

/**
 * Format path for FTP requests
 */
export const formatFtpPath = (connectionId: string, filePath: string): string => {
  return `${connectionId}:${filePath}`;
};

/**
 * Create cache-busting URL parameters
 */
export const createCacheBuster = (): string => {
  return `t=${Date.now()}`;
};
