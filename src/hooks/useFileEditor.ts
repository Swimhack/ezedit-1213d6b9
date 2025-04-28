
import { useState, useRef } from "react";
import { getFile, saveFile } from "@/lib/ftp";
import { toast } from "sonner";

export function useFileEditor(connectionId: string, filePath: string) {
  const [code, setCode] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const editorRef = useRef<any>(null);
  
  const loadFile = async () => {
    if (!connectionId || !filePath) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`/api/ftp/get-file?path=${encodeURIComponent(filePath)}`);
      if (!res.ok) throw new Error(`Failed to load (${res.status})`);
      const fileData = await res.text();
      
      if (fileData) {
        setCode(fileData);
        setHasUnsavedChanges(false);
        
        // Update Monaco editor if it exists
        if (editorRef.current) {
          editorRef.current.setValue(fileData);
        }
      } else {
        throw new Error("Failed to load file content");
      }
    } catch (error: any) {
      console.error("Error loading file:", error);
      setError(error.message || "Failed to load file");
      toast.error(`Error loading file: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSave = async () => {
    if (!connectionId || !filePath || !code) {
      toast.error("Missing data for saving");
      return;
    }
    
    setIsSaving(true);
    
    try {
      const { error } = await saveFile({
        id: connectionId,
        filepath: filePath,
        content: code,
        username: "editor-user"
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      toast.success("File saved successfully");
      setHasUnsavedChanges(false);
    } catch (error: any) {
      console.error("Error saving file:", error);
      toast.error(`Error saving file: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleCodeChange = (newCode: string | undefined) => {
    if (newCode !== undefined && newCode !== code) {
      setCode(newCode);
      setHasUnsavedChanges(true);
    }
  };
  
  // Language detection helper
  const detectLanguage = () => {
    if (!filePath) return "plaintext";
    
    const extension = filePath.split('.').pop()?.toLowerCase();
    const langMap: Record<string, string> = {
      js: "javascript",
      jsx: "javascript",
      ts: "typescript",
      tsx: "typescript",
      html: "html",
      htm: "html",
      css: "css",
      json: "json",
      md: "markdown",
      php: "php",
      py: "python",
      rb: "ruby",
      go: "go",
      java: "java",
      c: "c",
      cpp: "cpp",
      cs: "csharp",
      sql: "sql",
      yml: "yaml",
      yaml: "yaml",
      xml: "xml",
      sh: "shell",
      bash: "shell",
      txt: "plaintext"
    };
    
    return langMap[extension || ""] || "plaintext";
  };

  return {
    code,
    isLoading,
    isSaving,
    error,
    hasUnsavedChanges,
    editorRef,
    handleCodeChange,
    handleSave,
    loadFile,
    detectLanguage
  };
}
