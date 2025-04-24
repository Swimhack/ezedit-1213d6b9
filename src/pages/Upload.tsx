
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DashboardSidebar from "@/components/DashboardSidebar";
import FileUploader from "@/components/FileUploader";

const Upload = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      <div className="flex-grow flex">
        <DashboardSidebar />
        <main className="flex-grow p-6">
          <h1 className="text-2xl font-bold mb-6 text-ezwhite">Upload Files</h1>
          
          <div className="bg-eznavy-light rounded-lg p-6 max-w-md mx-auto">
            <FileUploader currentFolder="" onUploadComplete={handleUploadComplete} />
            
            <div className="mt-6 text-sm text-ezgray">
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
