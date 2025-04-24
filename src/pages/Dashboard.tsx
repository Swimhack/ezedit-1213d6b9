
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DashboardSidebar from "@/components/DashboardSidebar";
import FileManager from "@/components/FileManager";
import { useDashboardStats } from "@/hooks/useDashboardStats";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { stats, isLoading: statsLoading } = useDashboardStats();

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        toast.error("Please login to access the dashboard");
        navigate("/login");
        return;
      }
      
      setUser(data.session.user);
      setIsLoading(false);
    };
    
    checkUser();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        navigate("/login");
      } else if (session) {
        setUser(session.user);
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-pulse">Loading dashboard...</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow flex">
        <DashboardSidebar />
        <main className="flex-grow p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-ezwhite mb-2">Welcome back, {user?.email}</h1>
              <p className="text-ezgray">Manage your files and access your dashboard features below.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
              <div className="bg-eznavy-light p-6 rounded-lg border border-ezgray-dark">
                <h3 className="text-lg font-semibold text-ezwhite mb-2">Storage Usage</h3>
                <p className="text-2xl font-bold text-ezblue">
                  {statsLoading ? "..." : `${stats.storageUsage} MB`}
                </p>
                <p className="text-ezgray text-sm mt-1">of available storage</p>
              </div>
              
              <div className="bg-eznavy-light p-6 rounded-lg border border-ezgray-dark">
                <h3 className="text-lg font-semibold text-ezwhite mb-2">Total Files</h3>
                <p className="text-2xl font-bold text-ezblue">
                  {statsLoading ? "..." : stats.totalFiles}
                </p>
                <p className="text-ezgray text-sm mt-1">files uploaded</p>
              </div>
              
              <div className="bg-eznavy-light p-6 rounded-lg border border-ezgray-dark">
                <h3 className="text-lg font-semibold text-ezwhite mb-2">Recent Activity</h3>
                {statsLoading ? (
                  <p className="text-ezgray">Loading...</p>
                ) : stats.recentActivity.length > 0 ? (
                  <ul className="space-y-2">
                    {stats.recentActivity.map((activity, index) => (
                      <li key={index} className="text-sm">
                        <span className="text-ezwhite">{activity.name}</span>
                        <span className="text-ezgray ml-2">{activity.timestamp}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-ezgray">No recent activity</p>
                )}
              </div>
            </div>

            <div className="bg-eznavy-light rounded-lg border border-ezgray-dark">
              <FileManager />
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
