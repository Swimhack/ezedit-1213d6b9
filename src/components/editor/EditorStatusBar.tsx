
import React from 'react';
import { CheckCircle, Loader, AlertTriangle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

type StatusIntent = 'loading' | 'success' | 'warning' | 'error' | 'info';

interface EditorStatusBarProps {
  intent: StatusIntent;
  message: string;
  isEditable?: boolean;
  onRetry?: () => void;
}

export function EditorStatusBar({ 
  intent, 
  message, 
  isEditable = false,
  onRetry 
}: EditorStatusBarProps) {
  const getStatusIcon = () => {
    switch (intent) {
      case 'loading':
        return <Loader className="h-4 w-4 animate-spin text-primary" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'info':
      default:
        return null;
    }
  };

  return (
    <div className={`px-3 py-1.5 border-t flex items-center justify-between ${
      intent === 'error' ? 'bg-red-50 border-red-200' :
      intent === 'warning' ? 'bg-amber-50 border-amber-200' :
      intent === 'success' ? 'bg-green-50 border-green-200' :
      'bg-muted/10 border-border'
    }`}>
      <div className="flex items-center gap-2">
        {getStatusIcon()}
        <span className={`text-xs ${
          intent === 'error' ? 'text-red-700' :
          intent === 'warning' ? 'text-amber-700' :
          intent === 'success' ? 'text-green-700' :
          'text-muted-foreground'
        }`}>
          {message}
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        {isEditable && <span className="text-xs text-muted-foreground">Editing enabled</span>}
        
        {onRetry && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onRetry} 
            className="h-6 px-2 text-xs"
          >
            Retry
          </Button>
        )}
      </div>
    </div>
  );
}
