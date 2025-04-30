
import React from 'react';
import { Button } from '@/components/ui/button';
import { Paintbrush, Code, RefreshCw } from 'lucide-react';

interface VisualModeToolbarProps {
  gjsView: 'design' | 'code';
  onViewChange: (view: 'design' | 'code') => void;
  onRefresh?: () => void;
  readOnly?: boolean;
}

export function VisualModeToolbar({ 
  gjsView, 
  onViewChange,
  onRefresh,
  readOnly = false
}: VisualModeToolbarProps) {
  return (
    <div className="flex gap-2 p-2 border-b">
      <Button 
        size="sm" 
        variant={gjsView === 'design' ? 'default' : 'outline'}
        onClick={() => onViewChange('design')}
        className="flex items-center gap-1"
        disabled={readOnly}
      >
        <Paintbrush size={14} />
        Design
      </Button>
      <Button 
        size="sm" 
        variant={gjsView === 'code' ? 'default' : 'outline'}
        onClick={() => onViewChange('code')}
        className="flex items-center gap-1"
        disabled={readOnly}
      >
        <Code size={14} />
        Code
      </Button>
      {onRefresh && (
        <Button
          size="sm"
          variant="outline"
          onClick={onRefresh}
          className="flex items-center gap-1 ml-auto"
          title="Refresh preview"
        >
          <RefreshCw size={14} />
          Refresh
        </Button>
      )}
    </div>
  );
}
