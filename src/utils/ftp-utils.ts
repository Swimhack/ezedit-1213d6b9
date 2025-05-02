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
 * Log utility for centralized logging
 * This ensures all logs are captured for the /logs view
 */
export const logEvent = (message: string, level: 'log' | 'info' | 'warn' | 'error' = 'log', source = 'ftp') => {
  // Log to console first
  console[level](`[${source}] ${message}`);
  
  // Store in localStorage for persistence
  try {
    const storageKey = `${source}_logs`;
    const existingLogs = localStorage.getItem(storageKey);
    let logs = [];
    
    if (existingLogs) {
      logs = JSON.parse(existingLogs);
    }
    
    // Add new log entry
    logs.unshift({
      message,
      timestamp: Date.now(),
      type: level,
      source
    });
    
    // Keep only the latest 100 logs
    if (logs.length > 100) {
      logs = logs.slice(0, 100);
    }
    
    localStorage.setItem(storageKey, JSON.stringify(logs));
  } catch (err) {
    console.error('Failed to store log:', err);
  }
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
    logEvent(`safeFormatDate received falsy value: ${dateInput}`, 'warn', 'dateUtils');
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
      
      // If we couldn't parse it, log and return current date
      logEvent(`safeFormatDate could not parse string: ${dateInput}`, 'warn', 'dateUtils');
      return new Date().toISOString();
    }
    
    // Handle Date objects
    if (dateInput instanceof Date) {
      if (!isNaN(dateInput.getTime())) {
        return dateInput.toISOString();
      }
      logEvent(`safeFormatDate received invalid Date object`, 'warn', 'dateUtils');
      return new Date().toISOString();
    }
    
    // Handle timestamps (numbers)
    if (typeof dateInput === 'number') {
      if (isNaN(dateInput) || dateInput < 0) {
        logEvent(`safeFormatDate received invalid numeric timestamp: ${dateInput}`, 'warn', 'dateUtils');
        return new Date().toISOString();
      }
      
      const date = new Date(dateInput);
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
      
      logEvent(`safeFormatDate could not create valid date from number: ${dateInput}`, 'warn', 'dateUtils');
      return new Date().toISOString();
    }
    
    // Default fallback
    logEvent(`safeFormatDate received unexpected type: ${typeof dateInput}`, 'warn', 'dateUtils');
    return new Date().toISOString();
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    logEvent(`Date formatting error: ${errorMessage}, Value: ${JSON.stringify(dateInput)}`, 'error', 'dateUtils');
    // Return current date as fallback in case of any error
    return new Date().toISOString();
  }
};
