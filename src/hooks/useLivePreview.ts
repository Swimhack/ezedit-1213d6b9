
import { useEffect, useState } from "react";

export function useLivePreview(code: string, path: string) {
  const [src, setSrc] = useState("");
  
  useEffect(() => {
    const id = setTimeout(() => {
      if (/\.(html?|md|txt|css|js)$/i.test(path)) {
        setSrc(code);
      } else {
        setSrc("<p style='padding:2rem;font-family:system-ui'>Preview not available for this file type.</p>");
      }
    }, 400);
    
    return () => clearTimeout(id);
  }, [code, path]);
  
  return src;
}
