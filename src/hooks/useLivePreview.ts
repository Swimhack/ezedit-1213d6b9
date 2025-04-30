
import { useEffect, useState } from "react";

export function useLivePreview(code: string | undefined, path: string) {
  const [src, setSrc] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // If path is empty, return early
    if (!path) {
      setIsLoading(false);
      setSrc("");
      return;
    }

    setIsLoading(true);
    
    // Use the recommended fetch logic with cache busting
    fetch(`/api/readFile?path=${encodeURIComponent(path)}&t=${Date.now()}`, {
      cache: "no-store",
      headers: { "Pragma": "no-cache", "Cache-Control": "no-cache" },
    })
    .then(res => res.text())
    .then(content => {
      console.log(`[useLivePreview] Content loaded for ${path}, length: ${content?.length || 0}`);
      
      // When content is available but empty
      if (content === "") {
        console.log('[useLivePreview] Empty file content');
        setSrc(`<div style="padding:2rem;font-family:system-ui">Empty file – nothing to preview</div>`);
        setIsLoading(false);
        return;
      }
      
      // Set loading to false once we have content
      setIsLoading(false);
      
      if (/\.(html?|htm|php|md|txt|css|js)$/i.test(path)) {
        // For HTML content, wrap it in a proper HTML structure if it's just a fragment
        if (/\.(html?|htm|php)$/i.test(path) && !content.includes('<html')) {
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
${content}
</body>
</html>`;
          setSrc(htmlTemplate);
        } else {
          setSrc(content);
        }
      } else if (/\.(jpe?g|png|gif|svg|webp)$/i.test(path)) {
        // For image files, create a data URL if possible
        if (content.startsWith('data:')) {
          setSrc(content);
        } else {
          setSrc(`<div style="padding:2rem;font-family:system-ui">Image preview not available in code view.</div>`);
        }
      } else {
        setSrc(`<div style="padding:2rem;font-family:system-ui">Preview not available for this file type.</div>`);
      }
    })
    .catch(error => {
      console.error(`[useLivePreview] Error fetching file: ${error}`);
      setIsLoading(false);
      setSrc(`<div style="padding:2rem;font-family:system-ui;color:red">Error loading file: ${error.message}</div>`);
    });
    
  }, [path]);
  
  return { src, isLoading };
}
