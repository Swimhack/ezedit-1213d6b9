
import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DashboardSidebar from "@/components/DashboardSidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu, LayoutDashboard, Globe, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const mobileNavItems = [
  { icon: LayoutDashboard, label: "Overview", path: "/dashboard" },
  { icon: Globe, label: "My Sites", path: "/dashboard/sites" },
  { icon: Settings, label: "Settings", path: "/dashboard/settings" },
];

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast.error("Error signing out");
    } else {
      toast.success("Signed out successfully");
      navigate("/");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      {/* Add mt-16 to account for fixed header height */}
      <div className="flex-grow flex flex-col md:flex-row mt-16">
        {isMobile ? (
          <>
            <div className="px-4 py-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center">
                <Sheet open={open} onOpenChange={setOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="mr-3">
                      <Menu className="h-5 w-5" />
                      <span className="sr-only">Toggle Menu</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="p-4 w-64 bg-background">
                    <nav className="space-y-2 mt-8">
                      {mobileNavItems.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setOpen(false)}
                          className={`flex items-center gap-2 p-2 rounded-md transition-colors ${
                            location.pathname === item.path
                              ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                              : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
                          }`}
                        >
                          <item.icon className="h-5 w-5" />
                          {item.label}
                        </Link>
                      ))}
                      <Button
                        variant="ghost"
                        className="w-full flex items-center justify-start gap-2 p-2 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
                        onClick={() => {
                          handleLogout();
                          setOpen(false);
                        }}
                      >
                        <LogOut className="h-5 w-5" />
                        Logout
                      </Button>
                    </nav>
                  </SheetContent>
                </Sheet>
                <span className="text-lg font-semibold text-gray-900 dark:text-gray-100 inline-flex items-center">
                  {mobileNavItems.find(item => item.path === location.pathname)?.label || "Dashboard"}
                </span>
              </div>
              
              {/* Mobile Visible Logout Button */}
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleLogout}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Log out</span>
              </Button>
            </div>
          </>
        ) : (
          <DashboardSidebar />
        )}
        <main className="flex-1 p-4 md:p-6 bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default DashboardLayout;
