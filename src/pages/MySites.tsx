
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

const MySites = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<any | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [connectionErrorModal, setConnectionErrorModal] = useState({
    isOpen: false,
    siteName: '',
    errorMessage: '',
    helpfulMessage: ''
  });
  
  const { 
    sites, 
    isLoading, 
    isRefreshing,
    testResults, 
    fetchSites, 
    handleTestConnection,
    invalidate 
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
    // Refresh the list when a site is saved
    invalidate();
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
    
    try {
      // Test the connection first before opening the file explorer
      const result = await handleTestConnection(site);
      
      // Check if the connection was successful
      if (!result.success) {
        // Show error dialog with helpful message if available
        setConnectionErrorModal({
          isOpen: true,
          siteName: site.site_name || site.server_url,
          errorMessage: result.message,
          helpfulMessage: result.helpfulMessage || "Unable to connect to the FTP server. Please verify your credentials or try again later."
        });
        return;
      }
      
      // If successful, navigate to the file editor
      logEvent(`Opening file explorer for: ${site.site_name || site.server_url}`, "info", "fileExplorer");
      navigate("/editor/" + site.id);
    } catch (error: any) {
      console.error("Error testing connection:", error);
      // Show error dialog for unexpected errors
      setConnectionErrorModal({
        isOpen: true,
        siteName: site.site_name || site.server_url,
        errorMessage: "Connection error",
        helpfulMessage: "An unexpected error occurred while connecting to the FTP server. Please try again later."
      });
    }
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

        {/* Connection Error Modal */}
        <Dialog 
          open={connectionErrorModal.isOpen} 
          onOpenChange={(isOpen) => setConnectionErrorModal(prev => ({ ...prev, isOpen }))}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Connection Failed</DialogTitle>
              <DialogDescription>
                Could not connect to {connectionErrorModal.siteName}
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <p className="font-medium text-red-600 mb-2">{connectionErrorModal.errorMessage}</p>
              <p className="text-muted-foreground whitespace-pre-line">{connectionErrorModal.helpfulMessage}</p>
            </div>
            
            <DialogFooter className="flex justify-between gap-2">
              <Button 
                variant="outline" 
                onClick={() => handleEdit(sites.find(site => 
                  (site.site_name || site.server_url) === connectionErrorModal.siteName
                ))}
              >
                Edit Connection
              </Button>
              <Button 
                onClick={() => setConnectionErrorModal(prev => ({ ...prev, isOpen: false }))}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
