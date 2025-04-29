
/// <reference types="vite/client" />

interface Window {
  ENV?: {
    KLEIN_API_KEY?: string;
    TINYMCE_API_KEY?: string;
    currentFilePath?: string;
    [key: string]: any;
  }
}
