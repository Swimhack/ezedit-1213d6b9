
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

interface EzEditorProps {
  connectionId: string;
  filePath: string;
  username?: string;
}

export function EzEditor({ connectionId, filePath, username = "editor-user" }: EzEditorProps) {
  const [activeTab, setActiveTab] = useState<string>("code");
  const [prompt, setPrompt] = useState("");
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  
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

  // Try to acquire lock when file path changes
  useEffect(() => {
    if (filePath && connectionId) {
      acquireLock().then(success => {
        if (!success) {
          toast.error("Could not lock file for editing");
        }
      });
    }
  }, [filePath, connectionId, acquireLock]);

  // Load file when path changes or when we successfully acquire a lock
  useEffect(() => {
    if (isLocked && filePath) {
      loadFile();
    }
  }, [isLocked, filePath, loadFile]);

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
      
      <div className="flex p-2 border-b">
        <EditorTabNavigation 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          isHtmlFile={isHtmlFile} 
        />
      </div>
      
      <div className="flex-1 flex flex-col h-[calc(100%-88px)] overflow-hidden">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="h-6 w-6 animate-spin mr-2 rounded-full border-2 border-b-transparent border-primary" />
            <span>Loading file...</span>
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
