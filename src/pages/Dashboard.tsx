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

const Dashboard = () => {
  const navigate = useNavigate();
  const [sites, setSites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSite, setSelectedSite] = useState<any>(null);
  const [isAddSiteModalOpen, setIsAddSiteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [connectionTestResults, setConnectionTestResults] = useState<Record<string, boolean>>({});
  const { isPremium } = useSubscription();

  useEffect(() => {
    loadSites();
  }, []);

  const loadSites = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('ftp_connections')
        .select('*')
        .order('server_name', { ascending: true });

      if (error) throw error;

      setSites(data || []);
    } catch (error: any) {
      toast.error(`Error loading sites: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async (connection: any) => {
    try {
      // Attempt to list the root directory to test connection
      const { data, error } = await supabase.functions.invoke('listFtpFiles', {
        body: {
          host: connection.host,
          user: connection.username,
          pass: connection.password,
          port: connection.port || 21,
          sftp: false
        }
      });

      if (error) {
        toast.error(`Connection test failed: ${error.message}`);
        setConnectionTestResults(prev => ({
          ...prev,
          [connection.id]: false
        }));
        return;
      }

      if (data.success) {
        toast.success('Connection successful!');
        setConnectionTestResults(prev => ({
          ...prev,
          [connection.id]: true
        }));
      } else {
        toast.error(`Connection failed: ${data.error || 'Unknown error'}`);
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

  const handleViewFiles = (connection: any) => {
    navigate(`/editor/${connection.id}`);
  };

  const handleEditSite = (connection: any) => {
    setSelectedSite(connection);
    setIsEditModalOpen(true);
  };

  return (
    <TrialProtection>
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

          <AddSiteModal
            isOpen={isAddSiteModalOpen}
            onClose={() => setIsAddSiteModalOpen(false)}
            onSiteAdded={loadSites}
          />

          {selectedSite && (
            <FTPConnectionModal
              isOpen={isEditModalOpen}
              onClose={() => {
                setIsEditModalOpen(false);
                setSelectedSite(null);
              }}
              editConnection={selectedSite}
              onSave={loadSites}
            />
          )}
        </div>
      </DashboardLayout>
    </TrialProtection>
  );
};

export default Dashboard;
