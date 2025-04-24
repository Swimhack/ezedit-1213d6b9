
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Menu } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DashboardSidebar from "@/components/DashboardSidebar";
import FileUploader from "@/components/FileUploader";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Upload = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
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

  const handleUploadComplete = () => {
    toast.success("File uploaded successfully!");
    navigate("/dashboard/files");
  };

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
              Upload Files
            </span>
          </div>
        ) : (
          <DashboardSidebar />
        )}
        <main className={`flex-grow p-4 md:p-6 ${isMobile ? 'w-full' : ''}`}>
          <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-ezwhite">Upload Files</h1>
          
          <div className="bg-eznavy-light rounded-lg p-4 md:p-6 max-w-sm md:max-w-md mx-auto">
            <FileUploader currentFolder="" onUploadComplete={handleUploadComplete} />
            
            <div className="mt-4 md:mt-6 text-xs md:text-sm text-ezgray">
              <h3 className="font-medium text-ezwhite mb-2">Upload Guidelines:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Maximum file size: 50MB</li>
                <li>Supported formats: Images, Documents, PDFs</li>
                <li>Files are stored securely in your account</li>
                <li>You can organize files into folders later</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Upload;
