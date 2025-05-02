
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logEvent } from '@/utils/ftp-utils';

/**
 * Hook to handle navigation to logs page with context
 */
export function useLogsNavigation() {
  const navigate = useNavigate();
  
  const goToLogs = (source?: string) => {
    logEvent(`Navigating to logs page${source ? ` from ${source}` : ''}`, 'info', 'navigation');
    navigate('/logs');
  };
  
  const goToLogsWithFilter = (filter: string) => {
    logEvent(`Navigating to logs page with filter: ${filter}`, 'info', 'navigation');
    navigate(`/logs?filter=${encodeURIComponent(filter)}`);
  };
  
  return { goToLogs, goToLogsWithFilter };
}
