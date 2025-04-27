
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

  useEffect(() => {
    if (error) {
      setSrcDoc(`
        <body style="font:16px/1.5 system-ui;padding:2rem;
                     color:#f87171;background:#1e293b">
          <h3 style="margin:0 0 1rem;font:600 18px sans-serif">FTP Error</h3>
          <pre style="white-space:pre-wrap;">${error}</pre>
          <p style="margin-top:1rem;font-size:13px;">Check Dashboard ▸ Functions ▸ Logs</p>
        </body>`);
      return;
    }
    
    if (!content) return;
    
    const isPreviewableFile = fileName && /\.(html?|htm|php)$/i.test(fileName);
    
    if (isPreviewableFile && baseUrl) {
      setSrcDoc('');
    } else {
      const previewContent = `<pre style="white-space:pre-wrap;font-family:monospace;padding:1rem;">${
        content.replace(/[&<>]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]!))
      }</pre>`;
      setSrcDoc(previewContent);
    }
  }, [content, fileName, error, baseUrl]);

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
