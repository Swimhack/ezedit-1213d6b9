
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useFileEditor } from "@/hooks/useFileEditor";
import { useFtpLock } from "@/hooks/useFtpLock";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { FileEditorToolbar } from './ftp-explorer/FileEditorToolbar';
import { EditorTabNavigation } from './editor/EditorTabNavigation';
import { EditorContent } from './editor/EditorContent';
import { AiPromptSection } from './editor/AiPromptSection';
import { EditorErrorState } from './editor/EditorErrorState';
import { ModeToggle } from './ModeToggle';
import { mcpFtp } from '@/lib/mcpFtp';

interface EzEditorProps {
  connectionId: string;
  filePath: string;
  username?: string;
}

export function EzEditor({ connectionId, filePath, username = "editor-user" }: EzEditorProps) {
  const [activeTab, setActiveTab] = useState<string>("code");
  const [prompt, setPrompt] = useState("");
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [editorMode, setEditorMode] = useState<'local' | 'ftp'>('local');
  const [lastLocalPath, setLastLocalPath] = useState<string>('');
  const [lastFtpPath, setLastFtpPath] = useState<string>('');
  const [currentSite, setCurrentSite] = useState<any>(null);
  const [isFtpConnecting, setIsFtpConnecting] = useState(false);
  
  const {
    code,
    isLoading,
    isSaving,
    error,
    hasUnsavedChanges,
    autoSaveEnabled,
    isAutoSaving,
    handleCodeChange,
    handleSave,
    loadFile,
    refreshFile,
    toggleAutoSave,
    detectLanguage
  } = useFileEditor(connectionId, filePath);

  const {
    isLocked,
    error: lockError,
    acquireLock
  } = useFtpLock(connectionId, filePath, username);

  // Effect to handle mode changes and path memory
  useEffect(() => {
    if (editorMode === 'local') {
      // Switch to local mode
      if (lastLocalPath) {
        // Restore last local path if available
        console.log('[EzEditor] Restoring last local path:', lastLocalPath);
        // TODO: Implement path restoration logic
      }
    } else {
      // Switch to FTP mode
      if (filePath) {
        setLastLocalPath(filePath); // Remember local path before switching
      }
      
      // Load FTP site info
      loadFtpSiteInfo(connectionId);
      
      if (lastFtpPath) {
        // Restore last FTP path if available
        console.log('[EzEditor] Restoring last FTP path:', lastFtpPath);
        // TODO: Implement path restoration logic
      }
    }
  }, [editorMode, connectionId]);

  // Try to acquire lock when file path changes (local mode only)
  useEffect(() => {
    if (filePath && connectionId && editorMode === 'local') {
      acquireLock().then(success => {
        if (!success) {
          toast.error("Could not lock file for editing");
        }
      });
    }
  }, [filePath, connectionId, acquireLock, editorMode]);

  // Load file when path changes or when we successfully acquire a lock (local mode)
  useEffect(() => {
    if (editorMode === 'local' && isLocked && filePath) {
      loadFile();
    }
  }, [isLocked, filePath, loadFile, editorMode]);

  // Load FTP site information
  const loadFtpSiteInfo = async (siteId: string) => {
    if (!siteId) return;
    
    try {
      setIsFtpConnecting(true);
      
      // Fetch site information from Supabase or local storage
      // For now, we'll mock this with hardcoded data for testing
      const siteInfo = {
        id: siteId,
        site_name: "Test FTP Site",
        server_url: "ftp.example.com",
        port: 21,
        username: "ftpuser",
        password: "ftppassword",
        root_directory: "/"
      };
      
      setCurrentSite(siteInfo);
      
      // Connect to the FTP server
      const connected = await mcpFtp.setCredentials({
        host: siteInfo.server_url,
        port: siteInfo.port,
        username: siteInfo.username,
        password: siteInfo.password,
        rootDirectory: siteInfo.root_directory
      });
      
      if (!connected) {
        toast.error(`Failed to connect to FTP server: ${mcpFtp.getConnectionError()}`);
      }
    } catch (error: any) {
      console.error('[EzEditor] Failed to load FTP site info:', error);
      toast.error(`Failed to load FTP site: ${error.message}`);
    } finally {
      setIsFtpConnecting(false);
    }
  };

  const handleApplyAiChanges = async () => {
    if (!code || !prompt.trim()) return;
    
    setIsAiProcessing(true);
    
    try {
      const response = await supabase.functions.invoke('editFileAI', {
        body: { fileContent: code, prompt: prompt.trim(), filePath }
      });
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      if (response.data?.modifiedContent) {
        handleCodeChange(response.data.modifiedContent);
        toast.success("AI changes applied successfully");
        setPrompt("");
      } else {
        toast.error("No changes returned from AI");
      }
    } catch (error: any) {
      console.error("AI processing error:", error);
      toast.error(`Error applying AI changes: ${error.message}`);
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleModeChange = (mode: 'local' | 'ftp') => {
    if (mode === editorMode) return;
    
    // Save current path before switching modes
    if (editorMode === 'local' && filePath) {
      setLastLocalPath(filePath);
    } else if (editorMode === 'ftp' && filePath) {
      setLastFtpPath(filePath);
    }
    
    setEditorMode(mode);
  };

  if (!filePath) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        Please select a file to edit
      </div>
    );
  }

  if (error || lockError) {
    return <EditorErrorState error={error} lockError={lockError} onReload={() => window.location.reload()} />;
  }

  const isHtmlFile = /\.(html?|htm|php)$/i.test(filePath);

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-2 border-b bg-background">
        <FileEditorToolbar
          fileName={filePath}
          hasUnsavedChanges={hasUnsavedChanges}
          isSaving={isSaving}
          isAutoSaving={isAutoSaving}
          onSave={handleSave}
          onRefresh={refreshFile}
          autoSaveEnabled={autoSaveEnabled}
          onToggleAutoSave={toggleAutoSave}
        />
        
        <div className="flex items-center gap-3">
          {editorMode === 'ftp' && currentSite && (
            <span className="text-sm text-muted-foreground">
              Connected to: <span className="font-medium text-primary">{currentSite.site_name}</span>
            </span>
          )}
          
          <ModeToggle 
            mode={editorMode} 
            onModeChange={handleModeChange} 
            disabled={isFtpConnecting || isLoading || isSaving} 
          />
        </div>
      </div>
      
      <div className="flex p-2 border-b">
        <EditorTabNavigation 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          isHtmlFile={isHtmlFile} 
        />
      </div>
      
      <div className="flex-1 flex flex-col h-[calc(100%-88px)] overflow-hidden">
        {isLoading || isFtpConnecting ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="h-6 w-6 animate-spin mr-2 rounded-full border-2 border-b-transparent border-primary" />
            <span>{isFtpConnecting ? "Connecting to FTP server..." : "Loading file..."}</span>
          </div>
        ) : (
          <>
            <EditorContent 
              isLoading={isLoading}
              activeTab={activeTab}
              content={code}
              filePath={filePath}
              handleContentChange={handleCodeChange}
              detectLanguage={detectLanguage}
            />
            
            <AiPromptSection 
              prompt={prompt}
              setPrompt={setPrompt}
              isAiProcessing={isAiProcessing}
              onApplyAiChanges={handleApplyAiChanges}
            />
          </>
        )}
      </div>
    </div>
  );
}
