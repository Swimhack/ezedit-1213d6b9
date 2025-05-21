import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFTPSites } from "@/hooks/use-ftp-sites";
import { SiteCard } from "@/components/sites/SiteCard";
import { SiteFormModal } from "@/components/sites/SiteFormModal";
import { logEvent } from "@/utils/ftp-utils";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const MySites = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<any | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  
  const { 
    sites, 
    isLoading, 
    isRefreshing,
    testResults, 
    fetchSites, 
    handleTestConnection 
  } = useFTPSites();
  
  // Check current user and log page view
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        setUserId(data.session.user.id);
        console.log("Current user ID:", data.session.user.id);
      } else {
        console.log("No authenticated user found");
        toast.error("Please log in to view your sites.");
        navigate("/login");
      }
    };
    
    checkUser();
    logEvent("Viewing Sites page", "info", "navigation");
  }, [navigate]);

  // Refetch sites when user ID changes or when modal closes
  useEffect(() => {
    if (userId) {
      // Silent refresh when user ID changes
      fetchSites(true);
    }
  }, [userId, fetchSites]);

  const handleSaveSite = () => {
    // Silent refresh when a site is saved
    fetchSites(true);
    setIsModalOpen(false);
    setEditingSite(null);
    logEvent("Site saved", "info", "siteConfig");
  };

  const handleAddSite = () => {
    setEditingSite(null);
    setIsModalOpen(true);
    logEvent("Opening site dialog", "log", "siteConfig");
  };

  const handleEdit = (site: any) => {
    setEditingSite(site);
    setIsModalOpen(true);
    logEvent(`Editing site: ${site.site_name || site.server_url}`, "log", "siteConfig");
  };

  const handleViewFiles = async (site: any) => {
    logEvent(`Testing connection before opening file explorer: ${site.site_name || site.server_url}`, "info", "fileExplorer");
    
    // Test the connection first before opening the file explorer
    await handleTestConnection(site);
    
    // Delay to allow the test to complete and update the UI
    setTimeout(() => {
      // Check if the connection was successful
      if (testResults[site.id] === false) {
        toast.error("Failed to connect to the FTP server. Please verify your credentials and try again.");
        return;
      }
      
      logEvent(`Opening file explorer for: ${site.site_name || site.server_url}`, "info", "fileExplorer");
      navigate("/editor/" + site.id);
    }, 200);
  };

  // Render site cards or skeletons
  const renderSites = () => {
    if (isLoading) {
      return Array.from({ length: 3 }).map((_, i) => (
        <Skeleton 
          key={i} 
          className="border rounded-lg p-6 h-44"
        />
      ));
    }

    if (sites.length === 0) {
      return (
        <div className="col-span-full text-center py-6 md:py-8 border border-dashed border-gray-300 rounded-lg">
          <h3 className="text-lg md:text-xl font-medium mb-2">No sites connected yet</h3>
          <p className="text-gray-500 mb-4 px-4">
            Add your first FTP connection to start managing your sites
          </p>
          <Button onClick={handleAddSite} variant="outline">
            <PlusCircle className="mr-2" size={16} /> Connect a Site
          </Button>
        </div>
      );
    }

    return sites.map((site) => (
      <SiteCard
        key={site.id}
        site={site}
        testResult={testResults[site.id]}
        onTest={() => handleTestConnection(site)}
        onViewFiles={() => handleViewFiles(site)}
        onEdit={() => handleEdit(site)}
      />
    ));
  };

  return (
    <DashboardLayout>
      <div className="container py-4 md:py-6 space-y-4 md:space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">My Sites</h1>
            <p className="text-muted-foreground">Manage your FTP connections</p>
          </div>
          <Button onClick={handleAddSite} className="gap-1">
            <PlusCircle className="h-4 w-4" /> Add Site
          </Button>
        </div>

        {/* Debug information - only visible in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-gray-500">
            User ID: {userId || "Not logged in"}
            <br />
            Sites count: {sites.length}
            <br />
            Loading: {isLoading ? "true" : "false"}, Refreshing: {isRefreshing ? "true" : "false"}
          </div>
        )}

        {/* Use a div that doesn't reflow when content changes */}
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 min-h-[200px]">
          {renderSites()}
        </div>

        <div className="flex justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/logs')}
            className="flex items-center gap-2"
          >
            <FileText size={16} />
            View System Logs
          </Button>
        </div>

        <SiteFormModal
          isOpen={isModalOpen}
          site={editingSite}
          onClose={() => {
            setIsModalOpen(false);
            setEditingSite(null);
          }}
          onSave={handleSaveSite}
        />
      </div>
    </DashboardLayout>
  );
};

export default MySites;
