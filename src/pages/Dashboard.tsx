
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import { FTPConnectionCard } from '@/components/FTPConnectionCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AddSiteModal } from '@/components/sites/AddSiteModal';
import FTPConnectionModal from '@/components/FTPConnectionModal';
import TrialProtection from '@/components/TrialProtection';
import { useSubscription } from '@/hooks/useSubscription';

// Define types for our connections and modals
interface Site {
  id: string;
  server_name: string;
  host: string;
  username: string;
  password: string;
  port: number;
  web_url?: string | null;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [sites, setSites] = useState<Site[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [isAddSiteModalOpen, setIsAddSiteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [connectionTestResults, setConnectionTestResults] = useState<Record<string, boolean>>({});
  const { isPremium } = useSubscription();

  // Mock data for demonstration
  useEffect(() => {
    const mockSites = [
      {
        id: '1',
        server_name: 'My Website',
        host: 'ftp.example.com',
        username: 'user',
        password: 'password',
        port: 21,
        web_url: 'https://example.com'
      },
      {
        id: '2',
        server_name: 'Blog Site',
        host: 'ftp.myblog.com',
        username: 'blogger',
        password: 'password',
        port: 21,
        web_url: 'https://myblog.com'
      }
    ];

    setTimeout(() => {
      setSites(mockSites);
      setIsLoading(false);
    }, 800);
  }, []);

  const handleTestConnection = async (connection: Site) => {
    try {
      // Simulate connection test
      const success = Math.random() > 0.3; // 70% success rate
      
      if (success) {
        toast.success('Connection successful!');
        setConnectionTestResults(prev => ({
          ...prev,
          [connection.id]: true
        }));
      } else {
        toast.error(`Connection failed: Could not connect to server`);
        setConnectionTestResults(prev => ({
          ...prev,
          [connection.id]: false
        }));
      }
    } catch (error: any) {
      toast.error(`Connection test failed: ${error.message}`);
      setConnectionTestResults(prev => ({
        ...prev,
        [connection.id]: false
      }));
    }
  };

  const handleViewFiles = (connection: Site) => {
    navigate(`/editor/${connection.id}`);
  };

  const handleEditSite = (connection: Site) => {
    setSelectedSite(connection);
    setIsEditModalOpen(true);
  };

  // Function to handle adding a new site
  const handleSiteAdded = (newSite: Site) => {
    setSites(prev => [...prev, newSite]);
    setIsAddSiteModalOpen(false);
  };

  // Function to handle saving an updated site
  const handleSiteSaved = (updatedSite: Site) => {
    setSites(prev => prev.map(site => 
      site.id === updatedSite.id ? updatedSite : site
    ));
    setIsEditModalOpen(false);
    setSelectedSite(null);
  };

  return (
    <DashboardLayout>
      <div className="p-4 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">My FTP Sites</h1>
          <Button onClick={() => setIsAddSiteModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Site
          </Button>
        </div>

        {!isPremium && (
          <Card className="bg-yellow-50 border-yellow-200 p-4">
            <p className="text-yellow-800">
              <strong>Free Trial Mode:</strong> You can browse and edit files, but saving changes requires a premium subscription.
            </p>
          </Card>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="h-32 animate-pulse bg-gray-100" />
            ))}
          </div>
        ) : sites.length === 0 ? (
          <Card className="p-8 text-center">
            <h3 className="text-lg font-medium">No FTP sites yet</h3>
            <p className="text-gray-500 mt-2">
              Add your first FTP site to start editing your website files.
            </p>
            <Button 
              className="mt-4" 
              onClick={() => setIsAddSiteModalOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add FTP Site
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sites.map((site) => (
              <FTPConnectionCard
                key={site.id}
                connection={site}
                testResult={connectionTestResults[site.id]}
                onTest={() => handleTestConnection(site)}
                onViewFiles={() => handleViewFiles(site)}
                onEdit={() => handleEditSite(site)}
              />
            ))}
          </div>
        )}

        {/* Update the prop types for AddSiteModal and FTPConnectionModal */}
        <AddSiteModal
          isOpen={isAddSiteModalOpen}
          onClose={() => setIsAddSiteModalOpen(false)}
          onSiteAdded={handleSiteAdded}
        />

        {selectedSite && (
          <FTPConnectionModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedSite(null);
            }}
            editConnection={selectedSite}
            onSave={handleSiteSaved}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
