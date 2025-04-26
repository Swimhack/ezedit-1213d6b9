
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DashboardSidebar from "@/components/DashboardSidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  
  return (
    <div className="flex flex-col min-h-screen bg-eznavy-light">
      <Navbar />
      <div className="flex-grow flex flex-col md:flex-row">
        {/* Mobile sidebar with sheet */}
        {isMobile ? (
          <div className="px-4 py-2 bg-eznavy-light border-b border-ezgray-dark">
            <Sheet open={open} onOpenChange={setOpen}>
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
        <main className="flex-1 p-4">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default DashboardLayout;
