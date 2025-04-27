
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
    <div className="flex flex-col min-h-screen bg-eznavy-light">
      <Navbar />
      <div className="flex-grow flex flex-col md:flex-row">
        {isMobile ? (
          <>
            <div className="px-4 py-2 bg-eznavy-light border-b border-ezgray-dark">
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="mr-2">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-4 w-64 bg-eznavy-light">
                  <nav className="space-y-2">
                    {mobileNavItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setOpen(false)}
                        className={`flex items-center gap-2 p-2 rounded-md transition-colors ${
                          location.pathname === item.path
                            ? "bg-eznavy text-ezwhite"
                            : "text-ezgray hover:bg-eznavy hover:text-ezwhite"
                        }`}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>
              <span className="text-lg font-semibold text-ezwhite inline-flex items-center">
                {mobileNavItems.find(item => item.path === location.pathname)?.label || "Dashboard"}
              </span>
            </div>
          </>
        ) : (
          <DashboardSidebar />
        )}
        <main className="flex-1 p-4">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default DashboardLayout;
