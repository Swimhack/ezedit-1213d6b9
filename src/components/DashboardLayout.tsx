
import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DashboardSidebar from "@/components/DashboardSidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu, LayoutDashboard, Globe, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

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
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      {/* Add mt-16 to account for fixed header height */}
      <div className="flex-grow flex flex-col md:flex-row mt-16">
        {isMobile ? (
          <>
            <div className="px-4 py-2 bg-white border-b border-gray-200">
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="mr-2">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-4 w-64 bg-white">
                  <nav className="space-y-2">
                    {mobileNavItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setOpen(false)}
                        className={`flex items-center gap-2 p-2 rounded-md transition-colors ${
                          location.pathname === item.path
                            ? "bg-gray-100 text-gray-900"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>
              <span className="text-lg font-semibold text-gray-900 inline-flex items-center">
                {mobileNavItems.find(item => item.path === location.pathname)?.label || "Dashboard"}
              </span>
            </div>
          </>
        ) : (
          <DashboardSidebar />
        )}
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default DashboardLayout;
