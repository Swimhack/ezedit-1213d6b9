
import { ExternalLink } from "lucide-react";

interface ConnectionWebUrlProps {
  url: string | null | undefined;
  onClick: (e: React.MouseEvent) => void;
}

export function ConnectionWebUrl({ url, onClick }: ConnectionWebUrlProps) {
  if (!url) {
    return null;
  }
  
  return (
    <p className="text-sm flex items-center gap-1 truncate">
      <ExternalLink size={14} className="shrink-0 text-gray-500" />
      <a 
        href={url.startsWith('http') ? url : `https://${url}`} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline truncate"
        onClick={onClick}
      >
        {url}
      </a>
    </p>
  );
}
