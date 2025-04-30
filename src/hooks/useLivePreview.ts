
import { useEffect, useState } from "react";

export function useLivePreview(code: string | undefined, path: string) {
  const [src, setSrc] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const id = setTimeout(() => {
      // Handle undefined code as loading state
      if (code === undefined) {
        console.log('[useLivePreview] Code is undefined, setting loading state');
        setSrc("");
        setIsLoading(true);
        return;
      }
      
      // When code is available but empty
      if (code === "") {
        console.log('[useLivePreview] Empty file content');
        setSrc(`<div style="padding:2rem;font-family:system-ui">Empty file – nothing to preview</div>`);
        setIsLoading(false);
        return;
      }
      
      console.log(`[useLivePreview] Generating preview for ${path}, content length: ${code.length}`);
      setIsLoading(false);
      
      if (/\.(html?|htm|php|md|txt|css|js)$/i.test(path)) {
        // For HTML content, wrap it in a proper HTML structure if it's just a fragment
        if (/\.(html?|htm|php)$/i.test(path) && !code.includes('<html')) {
          const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 1rem; }
    pre { background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow: auto; }
  </style>
</head>
<body>
${code}
</body>
</html>`;
          setSrc(htmlTemplate);
        } else {
          setSrc(code);
        }
      } else if (/\.(jpe?g|png|gif|svg|webp)$/i.test(path)) {
        // For image files, create a data URL if possible
        if (code.startsWith('data:')) {
          setSrc(code);
        } else {
          setSrc(`<div style="padding:2rem;font-family:system-ui">Image preview not available in code view.</div>`);
        }
      } else {
        setSrc(`<div style="padding:2rem;font-family:system-ui">Preview not available for this file type.</div>`);
      }
    }, 400); // Short delay to prevent constant re-rendering during typing
    
    return () => clearTimeout(id);
  }, [code, path]);
  
  return { src, isLoading };
}
