
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Menu } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DashboardSidebar from "@/components/DashboardSidebar";
import FTPConnectionForm from "@/components/FTPConnectionForm";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const FTPConnection = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        toast.error("Please login to access FTP connections");
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
          <div className="animate-pulse">Loading...</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow flex flex-col md:flex-row">
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
              FTP Connection
            </span>
          </div>
        ) : (
          <DashboardSidebar />
        )}
        <main className="flex-grow p-4 md:p-6">
          <h1 className="text-xl md:text-2xl font-bold mb-6 text-ezwhite">FTP Connection</h1>
          <FTPConnectionForm />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default FTPConnection;
