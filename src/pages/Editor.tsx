
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import DashboardLayout from '@/components/DashboardLayout';
import { FileTreeWithModeToggle } from '@/components/FileTreeWithModeToggle';
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
  const [editorMode, setEditorMode] = useState<'local' | 'ftp'>('local');
  const { isPremium } = useSubscription();
  
  // Store panel sizes in localStorage
  const [panelSizes, setPanelSizes] = useLocalStorage('editor-panel-sizes', {
    explorer: 20,
    editor: 80,
  });

  useEffect(() => {
    const fetchConnection = async () => {
      if (!connectionId) {
        navigate('/my-sites');
        return;
      }

      try {
        // Try ftp_credentials table first (new schema)
        let { data, error } = await supabase
          .from('ftp_credentials')
          .select('*, site_name')
          .eq('id', connectionId)
          .single();

        // If not found, try ftp_connections table (old schema)
        if (error || !data) {
          const { data: legacyData, error: legacyError } = await supabase
            .from('ftp_connections')
            .select('*')
            .eq('id', connectionId)
            .single();

          if (legacyError) throw legacyError;
          data = legacyData;
        }
        
        if (data) {
          // Normalize the data structure for compatibility
          const normalizedConnection = {
            id: data.id,
            server_name: data.site_name || data.server_name || 'Unnamed Site',
            host: data.server_url || data.host,
            port: data.port || 21,
            username: data.username,
            password: data.encrypted_password || data.password,
            root_directory: data.root_directory
          };
          
          setConnection(normalizedConnection);
          console.log('[EditorPage] Connection loaded:', normalizedConnection.server_name);
        } else {
          toast.error('Connection not found');
          navigate('/my-sites');
        }
      } catch (error: any) {
        console.error('[EditorPage] Error loading connection:', error);
        toast.error(`Error loading connection: ${error.message}`);
        navigate('/my-sites');
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
      console.log(`[EditorPage] Loading file content: ${filePath} (mode: ${editorMode})`);
      
      let content = '';
      
      if (editorMode === 'ftp') {
        // Use MCP FTP to load file content
        if (typeof window !== 'undefined' && window.mcp?.ftp) {
          const result = await window.mcp.ftp.read_file({
            path: filePath,
            host: connection.host,
            port: connection.port,
            username: connection.username,
            password: connection.password
          });
          
          if (result.content) {
            content = result.content;
          } else if (result.error) {
            throw new Error(result.error);
          }
        } else {
          // Fallback for development
          content = `<!-- Mock FTP file content for ${filePath} -->\n<html>\n<head><title>Mock File</title></head>\n<body>\n<h1>This is mock content for ${filePath}</h1>\n</body>\n</html>`;
        }
      } else {
        // Use Supabase function for local mode
        const { data, error } = await supabase.functions.invoke('getFtpFile', {
          body: {
            connectionId,
            filePath
          }
        });
        
        if (error) throw error;
        content = data?.content || '';
      }
      
      setFileContent(content);
      console.log(`[EditorPage] File content loaded, length: ${content.length}`);
    } catch (error: any) {
      console.error('[EditorPage] Error loading file:', error);
      toast.error(`Error loading file: ${error.message}`);
    } finally {
      setIsFileLoading(false);
    }
  };

  const handleFileSelect = (file: any) => {
    console.log(`[EditorPage] File selected:`, file);
    
    if (typeof file === 'string') {
      // Handle string file paths
      setSelectedFile({ id: file, name: file.split('/').pop() || file, type: 'file' });
      loadFileContent(file);
    } else if (file.type === 'file' || !file.isFolder) {
      // Handle file objects
      setSelectedFile(file);
      loadFileContent(file.id || file.path);
    }
  };

  const handleSaveFile = async (content: string) => {
    if (!connectionId || !selectedFile) return;
    
    try {
      console.log(`[EditorPage] Saving file: ${selectedFile.id || selectedFile.path} (mode: ${editorMode})`);
      
      if (editorMode === 'ftp') {
        // Use MCP FTP to save file
        if (typeof window !== 'undefined' && window.mcp?.ftp) {
          const result = await window.mcp.ftp.write_file({
            path: selectedFile.id || selectedFile.path,
            content: content,
            host: connection.host,
            port: connection.port,
            username: connection.username,
            password: connection.password
          });
          
          if (result.error) {
            throw new Error(result.error);
          }
        } else {
          // Mock save for development
          console.log('[EditorPage] Mock FTP save completed');
        }
        
        toast.success("File saved to FTP");
      } else {
        // Use Supabase function for local mode
        const { data, error } = await supabase.functions.invoke('saveFtpFile', {
          body: {
            connectionId,
            filePath: selectedFile.id || selectedFile.path,
            content
          }
        });
        
        if (error) throw error;
        toast.success("File saved successfully");
      }
      
      return Promise.resolve();
    } catch (error: any) {
      console.error('[EditorPage] Error saving file:', error);
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

  const handleModeChange = (mode: 'local' | 'ftp') => {
    console.log(`[EditorPage] Editor mode changed to: ${mode}`);
    setEditorMode(mode);
    setSelectedFile(null);
    setFileContent('');
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading connection...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <TrialProtection>
      <DashboardLayout>
        <div className="p-4 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">
                {connection?.server_name} - File Editor
              </h1>
              <p className="text-sm text-muted-foreground">
                Mode: {editorMode.toUpperCase()} | 
                {!isPremium && " Preview Mode - Premium Required to Save"}
              </p>
            </div>
          </div>
          
          <div className="h-[calc(100vh-180px)] border rounded-lg overflow-hidden">
            <ResizablePanelGroup
              direction="horizontal"
              onLayout={handlePanelResize}
            >
              {/* File Explorer Panel */}
              <ResizablePanel defaultSize={panelSizes.explorer} minSize={15}>
                <FileTreeWithModeToggle 
                  connection={connection}
                  onSelectFile={handleFileSelect}
                  activeFilePath={selectedFile?.id || selectedFile?.path}
                  initialMode={editorMode}
                  onModeChange={handleModeChange}
                />
              </ResizablePanel>
              
              <ResizableHandle withHandle />
              
              {/* Code Editor Panel */}
              <ResizablePanel defaultSize={panelSizes.editor}>
                {selectedFile ? (
                  <CodeEditorWithPreview 
                    filePath={selectedFile.id || selectedFile.path}
                    initialContent={fileContent}
                    readOnly={!isPremium}
                    onSave={handleSaveFile}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="text-center">
                      <p className="text-lg mb-2">Select a file to edit</p>
                      <p className="text-sm">
                        Current mode: <span className="font-medium text-primary">{editorMode.toUpperCase()}</span>
                      </p>
                    </div>
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
