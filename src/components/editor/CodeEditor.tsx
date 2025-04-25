
import { FileCode2 } from "lucide-react";
import Editor from "@monaco-editor/react";

interface CodeEditorProps {
  content: string;
  language: string;
  onChange: (content: string | undefined) => void;
}

export function CodeEditor({ content, language, onChange }: CodeEditorProps) {
  return (
    <Editor
      height="100%"
      language={language}
      theme="vs-dark"
      value={content}
      onChange={onChange}
      options={{
        wordWrap: "on",
        minimap: { enabled: false },
        automaticLayout: true,
      }}
    />
  );
}
