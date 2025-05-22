
import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface ModeToggleProps {
  mode: 'local' | 'ftp';
  onModeChange: (mode: 'local' | 'ftp') => void;
  disabled?: boolean;
}

export function ModeToggle({ mode, onModeChange, disabled = false }: ModeToggleProps) {
  const handleToggleChange = (checked: boolean) => {
    onModeChange(checked ? 'ftp' : 'local');
  };
  
  return (
    <div className="flex items-center space-x-2">
      <Label htmlFor="mode-toggle" className={`text-sm ${mode === 'local' ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
        Local
      </Label>
      <Switch 
        id="mode-toggle"
        checked={mode === 'ftp'}
        onCheckedChange={handleToggleChange}
        disabled={disabled}
        aria-label="Toggle between Local and FTP mode"
      />
      <Label htmlFor="mode-toggle" className={`text-sm ${mode === 'ftp' ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
        FTP
      </Label>
    </div>
  );
}
