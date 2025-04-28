
import { useState, useEffect, useCallback } from "react";
import { lockFile } from "@/lib/ftp";
import { toast } from "sonner";

export function useFtpLock(connectionId: string | null, filePath: string | null, username: string) {
  const [isLocked, setIsLocked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  
  // Initialize lock
  const acquireLock = useCallback(async () => {
    if (!connectionId || !filePath || !username) {
      return false;
    }
    
    try {
      const { data, error } = await lockFile(connectionId, filePath, username);
      
      if (error) {
        console.error("Lock error:", error);
        setError(error.message || "Failed to lock file");
        setIsLocked(false);
        return false;
      }
      
      setIsLocked(true);
      setError(null);
      setExpiresAt(data.expires ? new Date(data.expires) : null);
      return true;
    } catch (err: any) {
      console.error("Lock exception:", err);
      setError(err.message || "Failed to lock file");
      setIsLocked(false);
      return false;
    }
  }, [connectionId, filePath, username]);

  // Set up automatic renewal
  useEffect(() => {
    if (!isLocked || !connectionId || !filePath || !username) return;
    
    const renewInterval = setInterval(async () => {
      try {
        const { data, error } = await lockFile(connectionId, filePath, username);
        
        if (error) {
          console.error("Lock renewal error:", error);
          toast.error("Failed to maintain file lock");
          setIsLocked(false);
          clearInterval(renewInterval);
          return;
        }
        
        setExpiresAt(data.expires ? new Date(data.expires) : null);
      } catch (err) {
        console.error("Lock renewal exception:", err);
        setIsLocked(false);
        clearInterval(renewInterval);
      }
    }, 30 * 1000); // Renew every 30 seconds
    
    return () => clearInterval(renewInterval);
  }, [isLocked, connectionId, filePath, username]);

  // Clear lock when unmounting or changing file
  useEffect(() => {
    return () => {
      setIsLocked(false);
      setError(null);
      setExpiresAt(null);
    };
  }, [connectionId, filePath]);

  return {
    isLocked,
    error,
    expiresAt,
    acquireLock,
    releaseLock: () => setIsLocked(false) // We'll rely on TTL expiration
  };
}
