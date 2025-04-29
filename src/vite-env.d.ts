
/// <reference types="vite/client" />

interface Window {
  ENV?: {
    KLEIN_API_KEY?: string;
    TINYMCE_API_KEY?: string;
    [key: string]: any;
  }
}
