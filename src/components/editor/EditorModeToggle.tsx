
import { Bot, Code } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface EditorModeToggleProps {
  mode: 'code' | 'wysiwyg';
  onChange: (value: 'code' | 'wysiwyg') => void;
  isHtmlFile: boolean;
}

export function EditorModeToggle({ mode, onChange, isHtmlFile }: EditorModeToggleProps) {
  return (
    <ToggleGroup 
      type="single" 
      value={mode}
      onValueChange={value => {
        if (value === 'code' || value === 'wysiwyg') {
          onChange(value);
        }
      }}
      className="ml-2"
    >
      <ToggleGroupItem 
        value="code" 
        aria-label="Toggle code editor"
        disabled={!isHtmlFile}
        title={!isHtmlFile ? "WYSIWYG only available for HTML files" : "Code editor"}
      >
        <Code className="h-4 w-4 mr-1" />
        Code
      </ToggleGroupItem>
      <ToggleGroupItem 
        value="wysiwyg" 
        aria-label="Toggle WYSIWYG editor"
        disabled={!isHtmlFile}
        title={!isHtmlFile ? "WYSIWYG only available for HTML files" : "Visual editor"}
      >
        <Bot className="h-4 w-4 mr-1" />
        WYSIWYG
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
