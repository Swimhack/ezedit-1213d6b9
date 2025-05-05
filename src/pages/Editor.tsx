
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import DashboardLayout from '@/components/DashboardLayout';
import FileExplorer from '@/components/editor/FileExplorer';
import CodeEditorWithPreview from '@/components/editor/CodeEditorWithPreview';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useSubscription } from '@/hooks/useSubscription';
import TrialProtection from '@/components/TrialProtection';

const EditorPage = () => {
  const { connectionId } = useParams<{ connectionId: string }>();
  const navigate = useNavigate();
  const [connection, setConnection] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fileContent, setFileContent] = useState<string>('');
  const [isFileLoading, setIsFileLoading] = useState(false);
  const { isPremium } = useSubscription();
  
  // Store panel sizes in localStorage
  const [panelSizes, setPanelSizes] = useLocalStorage('editor-panel-sizes', {
    explorer: 20,
    editor: 80,
  });

  useEffect(() => {
    const fetchConnection = async () => {
      if (!connectionId) {
        navigate('/dashboard');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('ftp_connections')
          .select('*')
          .eq('id', connectionId)
          .single();

        if (error) throw error;
        
        if (data) {
          setConnection(data);
        } else {
          toast.error('Connection not found');
          navigate('/dashboard');
        }
      } catch (error: any) {
        toast.error(`Error loading connection: ${error.message}`);
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchConnection();
  }, [connectionId, navigate]);

  const loadFileContent = async (filePath: string) => {
    if (!connectionId || !filePath) return;
    
    setIsFileLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('getFtpFile', {
        body: {
          connectionId,
          filePath
        }
      });
      
      if (error) throw error;
      
      if (data?.content) {
        setFileContent(data.content);
      } else {
        throw new Error('Failed to load file content');
      }
    } catch (error: any) {
      toast.error(`Error loading file: ${error.message}`);
    } finally {
      setIsFileLoading(false);
    }
  };

  const handleFileSelect = (file: any) => {
    if (file.type === 'file') {
      setSelectedFile(file);
      loadFileContent(file.id);
    }
  };

  const handleSaveFile = async (content: string) => {
    if (!connectionId || !selectedFile) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('saveFtpFile', {
        body: {
          connectionId,
          filePath: selectedFile.id,
          content
        }
      });
      
      if (error) throw error;
      
      toast.success('File saved successfully');
      return Promise.resolve();
    } catch (error: any) {
      toast.error(`Error saving file: ${error.message}`);
      return Promise.reject(error);
    }
  };

  const handlePanelResize = (sizes: number[]) => {
    setPanelSizes({
      explorer: sizes[0],
      editor: sizes[1],
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <TrialProtection>
      <DashboardLayout>
        <div className="p-4 space-y-4">
          <h1 className="text-2xl font-bold">
            {connection?.server_name} - File Editor
            {!isPremium && (
              <span className="ml-2 text-sm text-orange-500 font-normal">
                (Preview Mode - Premium Required to Save)
              </span>
            )}
          </h1>
          
          <div className="h-[calc(100vh-180px)] border rounded-lg overflow-hidden">
            <ResizablePanelGroup
              direction="horizontal"
              onLayout={handlePanelResize}
            >
              {/* File Explorer Panel */}
              <ResizablePanel defaultSize={panelSizes.explorer} minSize={15}>
                <FileExplorer 
                  connectionId={connection?.id}
                  onSelectFile={handleFileSelect} 
                />
              </ResizablePanel>
              
              <ResizableHandle withHandle />
              
              {/* Code Editor Panel */}
              <ResizablePanel defaultSize={panelSizes.editor}>
                {selectedFile ? (
                  <CodeEditorWithPreview 
                    filePath={selectedFile.id}
                    initialContent={fileContent}
                    readOnly={!isPremium}
                    onSave={handleSaveFile}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    Select a file to edit
                  </div>
                )}
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        </div>
      </DashboardLayout>
    </TrialProtection>
  );
}

export default EditorPage;
