
import { useEffect, useRef } from "react";

interface PreviewProps {
  content: string;
  iframeId: string;
}

export function Preview({ content, iframeId }: PreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Update iframe content when content prop changes
  useEffect(() => {
    if (iframeRef.current && content) {
      try {
        iframeRef.current.srcdoc = content;
        console.log("[Preview] Updated iframe content, length:", content.length);
      } catch (err) {
        console.error("[Preview] Error updating iframe:", err);
      }
    }
  }, [content]);
  
  return (
    <div className="h-full bg-white">
      <iframe
        id={iframeId}
        ref={iframeRef}
        className="w-full h-full border-0"
        title="Preview"
        sandbox="allow-same-origin allow-scripts"
        srcDoc={content}
      />
    </div>
  );
}
