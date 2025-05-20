
import React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface WysiwygPaneProps {
  content: string;
  mode: "preview" | "wysiwyg";
  onChange: (content: string) => void;
  readOnly: boolean;
}

export function WysiwygPane({ 
  content, 
  mode, 
  onChange,
  readOnly 
}: WysiwygPaneProps) {
  // For this mock, we'll just use an iframe for preview and disabled textarea for wysiwyg
  return (
    <div className="h-full flex flex-col">
      {mode === "preview" ? (
        <iframe
          srcDoc={content}
          title="Preview"
          className="w-full h-full border-0"
          sandbox="allow-scripts"
        />
      ) : readOnly ? (
        <div className="h-full flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800">
          <AlertCircle className="h-10 w-10 text-yellow-500 mb-2" />
          <h3 className="text-lg font-medium mb-1">Premium Feature</h3>
          <p className="text-sm text-center text-gray-500 max-w-xs">
            Visual editing is available for premium subscribers only. 
            Upgrade to unlock this feature.
          </p>
        </div>
      ) : (
        <div 
          className="p-4 h-full overflow-auto bg-white"
          contentEditable={!readOnly}
          dangerouslySetInnerHTML={{ __html: content }}
          onInput={(e) => onChange(e.currentTarget.innerHTML)}
        />
      )}
    </div>
  );
}
