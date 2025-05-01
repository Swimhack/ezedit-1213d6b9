
import { useEffect } from "react";
import { toast } from "sonner";

interface FileLoadEffectProps {
  isOpen: boolean;
  connectionId: string;
  filePath: string;
  loadFile: () => Promise<string>;
  forceRefresh?: number;
  setEditorMode?: (mode: 'code' | 'wysiwyg') => void;
}

export function useFileLoadEffect({
  isOpen,
  connectionId,
  filePath,
  loadFile,
  forceRefresh = 0,
  setEditorMode
}: FileLoadEffectProps) {
  // Load file content when modal is opened or refresh is triggered
  useEffect(() => {
    if (isOpen && connectionId && filePath) {
      console.log(`[useFileLoadEffect] Loading file ${filePath} (refresh: ${forceRefresh})`);
      
      loadFile()
        .then((content) => {
          // Strictly validate content
          if (!content || typeof content !== 'string' || content.trim().length === 0) {
            throw new Error("Invalid or empty file content received");
          }
          
          console.log(`[useFileLoadEffect] File loaded successfully, content length: ${content.length}`);
          
          // Detect file type and set appropriate editor mode if handler is provided
          if (setEditorMode) {
            const isHtml = /\.(html?|htm|php)$/i.test(filePath);
            setEditorMode(isHtml ? 'wysiwyg' : 'code');
          }
        })
        .catch((error) => {
          console.error(`[useFileLoadEffect] Error loading file: ${error.message}`);
          toast.error(`Failed to load file: ${error.message}`);
        });
    }
  }, [isOpen, connectionId, filePath, forceRefresh, loadFile, setEditorMode]);
}
