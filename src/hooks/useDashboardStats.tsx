
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DashboardStats {
  storageUsage: number;
  totalFiles: number;
  recentActivity: Array<{
    name: string;
    timestamp: string;
  }>;
}

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats>({
    storageUsage: 0,
    totalFiles: 0,
    recentActivity: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get list of all files in user-files bucket
        const { data: files, error } = await supabase
          .storage
          .from("user-files")
          .list();

        if (error) {
          console.error("Error fetching files:", error);
          return;
        }

        // Calculate total storage usage in MB
        const totalSize = files?.reduce((acc, file) => {
          return acc + (file.metadata?.size || 0);
        }, 0) || 0;

        // Convert to MB with 2 decimal places
        const storageUsageMB = Number((totalSize / (1024 * 1024)).toFixed(2));

        // Get recent activity (last 5 files)
        const recentFiles = files
          ?.sort((a, b) => {
            return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
          })
          .slice(0, 5)
          .map(file => ({
            name: file.name,
            timestamp: new Date(file.created_at || 0).toLocaleString(),
          })) || [];

        setStats({
          storageUsage: storageUsageMB,
          totalFiles: files?.length || 0,
          recentActivity: recentFiles,
        });
      } catch (error) {
        console.error("Error calculating stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();

    // Set up realtime subscription for file changes
    const channel = supabase
      .channel('storage_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'storage',
          table: 'objects'
        },
        () => {
          // Refresh stats when files change
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { stats, isLoading };
};
