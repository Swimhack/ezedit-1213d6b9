
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const { stats, isLoading } = useDashboardStats();
  const [user, setUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Check authentication state once on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          // Not logged in, redirect to login
          toast.error("Please login to access the dashboard");
          navigate("/login");
          return;
        }
        setUser(session.user);
      } catch (error) {
        console.error("Auth check error:", error);
        toast.error("Authentication error");
      } finally {
        // Always set authChecked to true, even if there was an error
        setAuthChecked(true);
      }
    };

    checkAuth();
  }, [navigate]);

  // Show loading state only during initial auth check
  if (!authChecked) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container py-6">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Storage Usage Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Storage Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "..." : `${stats.storageUsage} MB`}
              </div>
              <Progress
                value={Math.min((stats.storageUsage / 100) * 100, 100)}
                className="h-2 mt-2"
              />
              <p className="text-xs text-muted-foreground mt-2">
                {isLoading ? "Loading..." : `${stats.storageUsage}MB used of 100MB`}
              </p>
            </CardContent>
          </Card>

          {/* Sites Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Files</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "..." : stats.totalFiles}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Files stored across all sites
              </p>
            </CardContent>
          </Card>

          {/* Connected Sites Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Connected Sites</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <a 
                  href="/dashboard/sites" 
                  className="text-blue-500 hover:underline"
                >
                  Visit My Sites
                </a>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Manage your FTP connections
              </p>
            </CardContent>
          </Card>
        </div>

        <h2 className="text-xl font-bold mt-8 mb-4">Recent Activity</h2>
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              </div>
            ) : stats.recentActivity.length > 0 ? (
              <ul className="divide-y">
                {stats.recentActivity.map((activity, index) => (
                  <li key={index} className="p-4 flex justify-between">
                    <span className="font-medium">{activity.name}</span>
                    <span className="text-sm text-gray-500">{activity.timestamp}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-4 text-center text-gray-500">
                No recent activity
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
