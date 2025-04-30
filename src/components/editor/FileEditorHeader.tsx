
import { X } from "lucide-react";

interface FileEditorHeaderProps {
  filePath: string;
  onClose: () => void;
}

export function FileEditorHeader({ filePath, onClose }: FileEditorHeaderProps) {
  return (
    <div className="modal-header flex items-center justify-between px-4 py-2 border-b">
      <h2 className="text-lg font-semibold truncate">{filePath}</h2>
      <button 
        onClick={onClose} 
        aria-label="Close" 
        className="w-4 h-4"
      >
        <X />
      </button>
    </div>
  );
}
