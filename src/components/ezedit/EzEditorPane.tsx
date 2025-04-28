
import React from "react";
import MonacoEditor from "@monaco-editor/react";

export default function EzEditorPane({
  code,
  onChange,
  language = "html"
}: {
  code: string;
  onChange: (v: string) => void;
  language?: string;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow">
        <MonacoEditor
          height="60vh"
          defaultLanguage={language}
          value={code}
          onChange={v => onChange(v ?? "")}
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 14,
            tabSize: 2,
            automaticLayout: true
          }}
        />
      </div>
      <iframe
        className="flex-grow border-t w-full h-[40vh] bg-white dark:bg-gray-900"
        srcDoc={code}
        title="Preview"
        sandbox="allow-same-origin allow-scripts"
      />
    </div>
  );
}
