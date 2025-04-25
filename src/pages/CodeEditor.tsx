
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Save, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import FileTree from "@/components/FileTree";
import CodeEditorPane from "@/components/CodeEditorPane";
import ChatPane from "@/components/ChatPane";
import { Button } from "@/components/ui/button";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { useLocalStorage } from "@/hooks/use-local-storage";

const CodeEditor = () => {
  const [activeConnection, setActiveConnection] = useState<any>(null);
  const [activeFilePath, setActiveFilePath] = useState<string>("");
  const [activeFileContent, setActiveFileContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Store panel sizes in localStorage
  const [panelSizes, setPanelSizes] = useLocalStorage("editor-panel-sizes", {
    fileTree: 20,
    codeEditor: 55,
    chat: 25,
  });

  // Fetch the first FTP connection on mount
  useEffect(() => {
    const fetchFirstConnection = async () => {
      try {
        const { data, error } = await supabase
          .from("ftp_connections")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();
        
        if (error) throw error;
        if (data) {
          setActiveConnection(data);
        }
      } catch (error: any) {
        toast.error(`Error fetching FTP connection: ${error.message}`);
      }
    };
    
    fetchFirstConnection();
  }, []);

  // Handle file selection from the file tree
  const handleFileSelect = (filePath: string) => {
    setActiveFilePath(filePath);
  };

  // Handle panel resize
  const handlePanelResize = (sizes: number[]) => {
    setPanelSizes({
      fileTree: sizes[0],
      codeEditor: sizes[1],
      chat: sizes[2]
    });
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-120px)] overflow-hidden">
        <ResizablePanelGroup
          direction="horizontal"
          onLayout={handlePanelResize}
          className="h-full border rounded-lg"
        >
          {/* File Tree Panel */}
          <ResizablePanel defaultSize={panelSizes.fileTree} minSize={15}>
            <div className="h-full bg-eznavy-dark p-2">
              <h2 className="text-lg font-semibold text-ezwhite mb-2">Files</h2>
              {activeConnection ? (
                <FileTree 
                  connection={activeConnection} 
                  onSelectFile={handleFileSelect}
                  activeFilePath={activeFilePath}
                />
              ) : (
                <div className="text-ezgray p-2">No FTP connection available</div>
              )}
            </div>
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          {/* Code Editor Panel */}
          <ResizablePanel defaultSize={panelSizes.codeEditor}>
            <CodeEditorPane 
              connection={activeConnection}
              filePath={activeFilePath}
              onContentChange={setActiveFileContent}
            />
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          {/* Chat Panel */}
          <ResizablePanel defaultSize={panelSizes.chat} minSize={20}>
            <ChatPane 
              activeFilePath={activeFilePath}
              activeFileContent={activeFileContent}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </DashboardLayout>
  );
};

export default CodeEditor;
