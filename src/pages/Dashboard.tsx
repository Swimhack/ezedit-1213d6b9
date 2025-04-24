
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Menu } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DashboardSidebar from "@/components/DashboardSidebar";
import FileManager from "@/components/FileManager";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { stats, isLoading: statsLoading } = useDashboardStats();
  const isMobile = useIsMobile();

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
      <div className="flex-grow flex flex-col md:flex-row">
        {/* Mobile sidebar with sheet */}
        {isMobile ? (
          <div className="px-4 py-2 bg-eznavy-light border-b border-ezgray-dark">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="mr-2">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64 bg-eznavy-light border-r border-ezgray-dark">
                <DashboardSidebar />
              </SheetContent>
            </Sheet>
            <span className="text-lg font-semibold text-ezwhite inline-flex items-center">
              Dashboard
            </span>
          </div>
        ) : (
          <DashboardSidebar />
        )}
        <main className={`flex-grow p-4 md:p-6 ${isMobile ? 'w-full' : ''}`}>
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 md:mb-8">
              <h1 className="text-xl md:text-2xl font-bold text-ezwhite mb-2">Welcome back, {user?.email}</h1>
              <p className="text-ezgray text-sm md:text-base">Manage your files and access your dashboard features below.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
              <div className="bg-eznavy-light p-4 md:p-6 rounded-lg border border-ezgray-dark">
                <h3 className="text-base md:text-lg font-semibold text-ezwhite mb-2">Storage Usage</h3>
                <p className="text-xl md:text-2xl font-bold text-ezblue">
                  {statsLoading ? "..." : `${stats.storageUsage} MB`}
                </p>
                <p className="text-ezgray text-xs md:text-sm mt-1">of available storage</p>
              </div>
              
              <div className="bg-eznavy-light p-4 md:p-6 rounded-lg border border-ezgray-dark">
                <h3 className="text-base md:text-lg font-semibold text-ezwhite mb-2">Total Files</h3>
                <p className="text-xl md:text-2xl font-bold text-ezblue">
                  {statsLoading ? "..." : stats.totalFiles}
                </p>
                <p className="text-ezgray text-xs md:text-sm mt-1">files uploaded</p>
              </div>
              
              <div className="bg-eznavy-light p-4 md:p-6 rounded-lg border border-ezgray-dark">
                <h3 className="text-base md:text-lg font-semibold text-ezwhite mb-2">Recent Activity</h3>
                {statsLoading ? (
                  <p className="text-ezgray text-sm">Loading...</p>
                ) : stats.recentActivity.length > 0 ? (
                  <ul className="space-y-1 md:space-y-2">
                    {stats.recentActivity.map((activity, index) => (
                      <li key={index} className="text-xs md:text-sm">
                        <span className="text-ezwhite">{activity.name}</span>
                        <span className="text-ezgray ml-2">{activity.timestamp}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-ezgray text-sm">No recent activity</p>
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
