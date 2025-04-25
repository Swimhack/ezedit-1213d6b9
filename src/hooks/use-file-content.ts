
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface UseFileContentProps {
  connection: {
    host: string;
    port: number;
    username: string;
    password: string;
  } | null;
  filePath: string;
}

export function useFileContent({ connection, filePath }: UseFileContentProps) {
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (filePath && connection) {
      fetchFileContent();
    }
  }, [filePath, connection]);

  const fetchFileContent = async () => {
    if (!connection) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`https://natjhcqynqziccssnwim.supabase.co/functions/v1/ftp-download-file`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          host: connection.host,
          port: connection.port,
          username: connection.username,
          password: connection.password,
          path: filePath
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        const decodedContent = atob(data.content);
        setContent(decodedContent);
        setHasUnsavedChanges(false);
      } else {
        toast.error(`Failed to download file: ${data.message}`);
      }
    } catch (error: any) {
      toast.error(`Error downloading file: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const saveContent = async () => {
    if (!connection || !filePath) {
      toast.error("No file selected");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`https://natjhcqynqziccssnwim.supabase.co/functions/v1/ftp-upload-file`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          host: connection.host,
          port: connection.port,
          username: connection.username,
          password: connection.password,
          path: filePath,
          content: btoa(content)
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("File saved successfully!");
        setHasUnsavedChanges(false);
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast.error(`Failed to save file: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const updateContent = (newContent: string) => {
    setContent(newContent);
    setHasUnsavedChanges(true);
  };

  return {
    content,
    isLoading,
    isSaving,
    hasUnsavedChanges,
    updateContent,
    saveContent
  };
}
