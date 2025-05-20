
/**
 * Type augmentation for GrapesJS
 * Extends the original type definitions with properties that might be missing
 */
import 'grapesjs';

declare module 'grapesjs' {
  // Add missing properties to ButtonProps
  interface ButtonProps {
    label?: string;
    attributes?: Record<string, string>;
    className?: string;
    active?: boolean;
    command?: string;
    context?: string;
    id?: string;
  }
  
  // Add missing properties to BlockProperties
  interface BlockProperties {
    id?: string;
    label?: string;
    content?: string | object;
    category?: string;
    attributes?: Record<string, any>;
    media?: string;
    activate?: boolean;
    select?: boolean;
    resetId?: boolean;
    drag?: boolean | object;
    copy?: boolean;
  }
  
  // Add missing properties to StorageManagerConfig
  interface StorageManagerConfig {
    id?: string;
    type?: string;
    autosave?: boolean;
    autoload?: boolean;
    stepsBeforeSave?: number;
    contentTypeJson?: boolean;
    options?: {
      local?: any;
      remote?: {
        urlStore?: string;
        urlLoad?: string;
        contentTypeJson?: boolean;
        credentials?: RequestCredentials;
        headers?: Record<string, string>;
        onStore?: (data: any) => any;
        onLoad?: (result: any) => any;
        fetchOptions?: RequestInit;
      };
    };
  }
}
