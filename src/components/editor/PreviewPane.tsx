
import { useEffect, useState } from "react";

interface PreviewPaneProps {
  fileName: string | null;
  content: string;
  baseUrl: string;
  error?: string;
  refreshKey: number;
}

export function PreviewPane({ 
  fileName, 
  content, 
  baseUrl, 
  error, 
  refreshKey 
}: PreviewPaneProps) {
  const [srcDoc, setSrcDoc] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (error) {
      setSrcDoc(`
        <body style="font:16px/1.5 system-ui;padding:2rem;
                     color:#f87171;background:#1e293b">
          <h3 style="margin:0 0 1rem;font:600 18px sans-serif">FTP Error</h3>
          <pre style="white-space:pre-wrap;">${error}</pre>
          <p style="margin-top:1rem;font-size:13px;">Check Dashboard ▸ Functions ▸ Logs</p>
        </body>`);
      setIsLoading(false);
      return;
    }
    
    // Mark as not loading once we have content (even if empty)
    if (content !== undefined) {
      setIsLoading(false);
    }
    
    if (!content && content !== "") {
      // Keep loading state if content is undefined/null
      setIsLoading(true);
      return;
    }
    
    // Handle empty content case
    if (content === "") {
      setSrcDoc(`
        <body style="font:16px/1.5 system-ui;padding:2rem;
                     color:#64748b;background:#f8fafc">
          <p>Empty file – nothing to preview</p>
        </body>`);
      setIsLoading(false);
      return;
    }
    
    console.log("Visual fileContent typeof:", typeof content);
    console.log("Visual fileContent length:", content?.length);
    console.log("Visual preview content:", content?.slice(0, 200));
    
    const isPreviewableFile = fileName && /\.(html?|htm|php)$/i.test(fileName);
    
    if (isPreviewableFile) {
      if (baseUrl) {
        setSrcDoc('');
        setIsLoading(false);
      } else {
        let previewContent = content;
        
        if (!content.includes('<html') && !content.includes('<!DOCTYPE')) {
          previewContent = `
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
        }
        
        setSrcDoc(previewContent);
        setIsLoading(false);
      }
    } else {
      const previewContent = `<pre style="white-space:pre-wrap;font-family:monospace;padding:1rem;">${
        content.replace(/[&<>]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]!))
      }</pre>`;
      setSrcDoc(previewContent);
      setIsLoading(false);
    }
  }, [content, fileName, error, baseUrl]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
        <span>Loading preview...</span>
      </div>
    );
  }

  if (fileName || error) {
    if (fileName && /\.(html?|htm|php)$/i.test(fileName) && baseUrl) {
      return (
        <iframe
          key={fileName}
          data-key={refreshKey}
          src={`${baseUrl}${fileName.startsWith('/') ? '' : '/'}${fileName}`}
          className="w-full h-full pt-4 bg-white"
          title="Live Preview"
        />
      );
    }
    return (
      <iframe
        srcDoc={srcDoc}
        data-key={refreshKey}
        className="w-full h-full pt-4 bg-white"
        title="Preview"
        sandbox="allow-same-origin allow-scripts allow-forms"
      />
    );
  }

  return (
    <div className="flex items-center justify-center h-full text-muted-foreground">
      No preview available
    </div>
  );
}
