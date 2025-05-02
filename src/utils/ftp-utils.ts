
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

/**
 * Safely format date values, catching and handling invalid date inputs
 * @param dateInput Any potential date value
 * @returns ISO string date or null if invalid
 */
export const safeFormatDate = (dateInput: any): string | null => {
  if (!dateInput) return null;
  
  try {
    // Handle string dates
    if (typeof dateInput === 'string') {
      const date = new Date(dateInput);
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
      return dateInput; // Return original string if it can't be parsed
    }
    
    // Handle Date objects
    if (dateInput instanceof Date) {
      if (!isNaN(dateInput.getTime())) {
        return dateInput.toISOString();
      }
      return null; // Return null for invalid Date objects
    }
    
    // Handle timestamps
    if (typeof dateInput === 'number') {
      if (isNaN(dateInput) || dateInput < 0) return null;
      const date = new Date(dateInput);
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
      return null;
    }
    
    return null;
  } catch (e) {
    console.error("Date formatting error:", e, "Value:", dateInput);
    return null;
  }
};

