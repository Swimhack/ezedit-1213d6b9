
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFileEditor } from "@/hooks/useFileEditor";
import { useFtpLock } from "@/hooks/useFtpLock";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { FileEditorToolbar } from './ftp-explorer/FileEditorToolbar';
import { Loader, Code, Edit3 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Editor from "@monaco-editor/react";
import { PreviewTab } from './editor/PreviewTab';

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
    handleCodeChange,
    handleSave,
    loadFile,
    refreshFile,
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
    return (
      <div className="h-full flex flex-col items-center justify-center text-red-500">
        <p className="mb-4">Error: {error || lockError}</p>
        <Button onClick={() => window.location.reload()}>Reload</Button>
      </div>
    );
  }

  const isHtmlFile = /\.(html?|htm|php)$/i.test(filePath);

  return (
    <div className="flex flex-col h-full">
      <FileEditorToolbar
        fileName={filePath}
        hasUnsavedChanges={hasUnsavedChanges}
        isSaving={isSaving}
        onSave={handleSave}
        onRefresh={refreshFile}
      />
      
      <div className="flex p-2 border-b">
        <TabsList>
          <TabsTrigger 
            value="code" 
            onClick={() => setActiveTab("code")}
            className="flex items-center gap-1"
            data-state={activeTab === 'code' ? 'active' : ''}
          >
            <Code className="w-4 h-4" />
            Code
          </TabsTrigger>
          {isHtmlFile && (
            <TabsTrigger 
              value="visual" 
              onClick={() => setActiveTab("visual")}
              className="flex items-center gap-1"
              data-state={activeTab === 'visual' ? 'active' : ''}
            >
              <Edit3 className="w-4 h-4" />
              Visual
            </TabsTrigger>
          )}
        </TabsList>
      </div>
      
      <div className="flex-1 flex flex-col h-[calc(100%-88px)] overflow-hidden">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader className="h-6 w-6 animate-spin mr-2" />
            <span>Loading file...</span>
          </div>
        ) : (
          <div className="flex-1 grid grid-rows-[1fr_auto]">
            <div className="flex flex-col md:flex-row h-full">
              {/* Editor Section */}
              <div className={`${activeTab === 'visual' ? 'hidden md:block' : ''} flex-1 h-full border-r`}>
                <Editor
                  height="100%"
                  language={detectLanguage()}
                  theme="vs-dark"
                  value={code}
                  onChange={handleCodeChange}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    wordWrap: 'on',
                    automaticLayout: true,
                  }}
                />
              </div>
              
              {/* Preview Section */}
              <div className={`${activeTab === 'code' ? 'hidden md:block' : ''} flex-1 h-full bg-white`}>
                <PreviewTab content={code || ''} fileName={filePath} />
              </div>
            </div>
            
            {/* AI Prompt Section */}
            <div className="p-2 border-t flex gap-2">
              <Textarea
                placeholder="Describe the changes you want to make..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="flex-1 h-16 resize-none"
                disabled={isAiProcessing}
              />
              <Button 
                onClick={handleApplyAiChanges} 
                disabled={!prompt.trim() || isAiProcessing}
                className="shrink-0 self-end"
              >
                {isAiProcessing ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : "Apply Changes"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
