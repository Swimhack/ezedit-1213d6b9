
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DashboardSidebar from "@/components/DashboardSidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [layoutReady, setLayoutReady] = useState(false);
  
  // Check authentication only once on mount and set ready state
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        // Even if not authenticated, just mark layout as ready
        // The individual pages will handle redirects as needed
      } catch (error) {
        console.error("Auth check error in layout:", error);
      } finally {
        // Always mark layout as ready, even after error
        setLayoutReady(true);
      }
    };
    
    checkAuth();
  }, []);
  
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast.error("Error signing out");
      } else {
        toast.success("Signed out successfully");
        navigate("/");
      }
    } catch (err) {
      console.error("Logout error:", err);
      toast.error("Error during sign out");
    }
  };

  // Show minimal layout during initial load to avoid flicker
  if (!layoutReady) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex-grow flex flex-col md:flex-row mt-16">
          <main className="flex-1 p-6 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex-grow flex flex-col md:flex-row mt-16">
        {isMobile ? (
          <>
            <div className="px-4 py-2 bg-white border-b flex items-center justify-between">
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64">
                  <DashboardSidebar />
                </SheetContent>
              </Sheet>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleLogout}
              >
                Log Out
              </Button>
            </div>
          </>
        ) : (
          <DashboardSidebar />
        )}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default DashboardLayout;
