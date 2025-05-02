
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
 * This enhanced version handles all edge cases like invalid dates, undefined values,
 * and various date formats
 * 
 * @param dateInput Any potential date value
 * @returns ISO string date or fallback date if invalid
 */
export const safeFormatDate = (dateInput: any): string => {
  // Return current date as fallback if input is falsy
  if (!dateInput) {
    return new Date().toISOString();
  }
  
  try {
    // Handle string dates
    if (typeof dateInput === 'string') {
      // If it looks like a timestamp, try to parse it as a number
      if (/^\d+$/.test(dateInput)) {
        const timestamp = parseInt(dateInput, 10);
        if (!isNaN(timestamp)) {
          const date = new Date(timestamp);
          if (!isNaN(date.getTime())) {
            return date.toISOString();
          }
        }
      }
      
      // Try parsing as date string
      const date = new Date(dateInput);
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
      
      // If we couldn't parse it, return current date
      return new Date().toISOString();
    }
    
    // Handle Date objects
    if (dateInput instanceof Date) {
      if (!isNaN(dateInput.getTime())) {
        return dateInput.toISOString();
      }
      return new Date().toISOString();
    }
    
    // Handle timestamps (numbers)
    if (typeof dateInput === 'number') {
      if (isNaN(dateInput) || dateInput < 0) {
        return new Date().toISOString();
      }
      
      const date = new Date(dateInput);
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
      
      return new Date().toISOString();
    }
    
    // Default fallback
    return new Date().toISOString();
  } catch (e) {
    console.error("Date formatting error:", e, "Value:", dateInput);
    // Return current date as fallback in case of any error
    return new Date().toISOString();
  }
};
