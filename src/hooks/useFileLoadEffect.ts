
import { useEffect } from "react";

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
      
      loadFile().then(() => {
        // Detect file type and set appropriate editor mode if handler is provided
        if (setEditorMode) {
          const isHtml = /\.(html?|htm|php)$/i.test(filePath);
          setEditorMode(isHtml ? 'wysiwyg' : 'code');
        }
      });
    }
  }, [isOpen, connectionId, filePath, forceRefresh, loadFile, setEditorMode]);
}
