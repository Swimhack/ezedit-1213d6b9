import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFTPSites } from "@/hooks/use-ftp-sites";
import { SiteCard } from "@/components/sites/SiteCard";
import { SiteFormModal } from "@/components/sites/SiteFormModal";
import { logEvent } from "@/utils/ftp-utils";

const MySites = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<any | null>(null);
  
  const { 
    sites, 
    isLoading, 
    testResults, 
    fetchSites, 
    handleTestConnection 
  } = useFTPSites();
  
  // Log page view for tracking
  useEffect(() => {
    logEvent("Viewing Sites page", "info", "navigation");
  }, []);

  const handleSaveSite = () => {
    fetchSites();
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
    logEvent(`Editing site: ${site.site_name}`, "log", "siteConfig");
  };

  const handleViewFiles = (site: any) => {
    logEvent(`Opening file explorer for: ${site.site_name}`, "info", "fileExplorer");
    // We will implement file browsing in another step
    navigate("/dashboard/sites/files", { state: { site } });
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

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border rounded-lg p-6 animate-pulse">
                <div className="w-1/3 h-5 bg-gray-200 rounded mb-4"></div>
                <div className="w-full h-4 bg-gray-200 rounded mb-2"></div>
                <div className="w-2/3 h-4 bg-gray-200 rounded mb-4"></div>
                <div className="flex justify-between mt-6">
                  <div className="w-1/4 h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))
          ) : sites.length === 0 ? (
            <div className="col-span-full text-center py-6 md:py-8 border border-dashed border-gray-300 rounded-lg">
              <h3 className="text-lg md:text-xl font-medium mb-2">No sites connected yet</h3>
              <p className="text-gray-500 mb-4 px-4">
                Add your first FTP connection to start managing your sites
              </p>
              <Button onClick={handleAddSite} variant="outline">
                <PlusCircle className="mr-2" size={16} /> Connect a Site
              </Button>
            </div>
          ) : (
            sites.map((site) => (
              <SiteCard
                key={site.id}
                site={site}
                testResult={testResults[site.id]}
                onTest={() => handleTestConnection(site)}
                onViewFiles={() => handleViewFiles(site)}
                onEdit={() => handleEdit(site)}
              />
            ))
          )}
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
