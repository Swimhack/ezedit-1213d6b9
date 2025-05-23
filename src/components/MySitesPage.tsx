
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2, Settings, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFTPSites } from "@/hooks/use-ftp-sites";
import { SiteCard } from "@/components/sites/SiteCard";
import { SiteFormModal } from "@/components/sites/SiteFormModal";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export function MySitesPage() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<any | null>(null);
  const [connectionErrorModal, setConnectionErrorModal] = useState({
    isOpen: false,
    siteName: '',
    errorMessage: '',
    helpfulMessage: ''
  });
  
  const { 
    sites, 
    isLoading, 
    testResults, 
    handleTestConnection,
    invalidate 
  } = useFTPSites();

  const handleSaveSite = () => {
    invalidate();
    setIsModalOpen(false);
    setEditingSite(null);
    toast.success("FTP site saved successfully");
  };

  const handleAddSite = () => {
    setEditingSite(null);
    setIsModalOpen(true);
  };

  const handleEdit = (site: any) => {
    setEditingSite(site);
    setIsModalOpen(true);
  };

  const handleConnect = async (site: any) => {
    try {
      console.log(`[MySitesPage] Testing connection to: ${site.site_name || site.server_url}`);
      
      const result = await handleTestConnection(site);
      
      if (result.success) {
        toast.success("FTP site connected");
        navigate(`/editor/${site.id}`);
      } else {
        console.error(`[MySitesPage] Connection failed:`, result.message);
        
        setConnectionErrorModal({
          isOpen: true,
          siteName: site.site_name || site.server_url,
          errorMessage: result.message,
          helpfulMessage: result.helpfulMessage || "Please verify your FTP credentials and try again."
        });
      }
    } catch (error: any) {
      console.error(`[MySitesPage] Error connecting to site:`, error);
      toast.error(`Error: Could not connect to server - ${error.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">My Sites</h1>
          <Button onClick={handleAddSite} disabled>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Site
          </Button>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border rounded-lg p-6 h-44 animate-pulse bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">My Sites</h1>
          <p className="text-muted-foreground">Manage your FTP connections</p>
        </div>
        <Button onClick={handleAddSite} className="gap-2">
          <PlusCircle className="h-4 w-4" />
          New Site
        </Button>
      </div>

      {sites.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
          <h3 className="text-xl font-medium mb-2">No FTP sites configured</h3>
          <p className="text-gray-500 mb-6">
            Add your first FTP connection to start managing your website files
          </p>
          <Button onClick={handleAddSite} variant="outline">
            <PlusCircle className="mr-2" size={16} />
            Add Your First Site
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {sites.map((site) => (
            <SiteCard
              key={site.id}
              site={site}
              testResult={testResults[site.id]}
              onTest={() => handleTestConnection(site)}
              onViewFiles={() => handleConnect(site)}
              onEdit={() => handleEdit(site)}
            />
          ))}
        </div>
      )}

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
              onClick={() => {
                const site = sites.find(s => 
                  (s.site_name || s.server_url) === connectionErrorModal.siteName
                );
                if (site) handleEdit(site);
              }}
            >
              <Settings className="h-4 w-4 mr-2" />
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
  );
}
