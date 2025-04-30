
/**
 * Detect appropriate language mode for code editor based on file extension
 */
export function detectLanguage(filePath: string): string {
  if (!filePath) return "plaintext";
  
  const extension = filePath.split('.').pop()?.toLowerCase();
  const langMap: Record<string, string> = {
    js: "javascript",
    jsx: "javascript",
    ts: "typescript",
    tsx: "typescript",
    html: "html",
    htm: "html",
    css: "css",
    json: "json",
    md: "markdown",
    php: "php",
    py: "python",
    rb: "ruby",
    go: "go",
    java: "java",
    c: "c",
    cpp: "cpp",
    cs: "csharp",
    sql: "sql",
    yml: "yaml",
    yaml: "yaml",
    xml: "xml",
    sh: "shell",
    bash: "shell",
    txt: "plaintext"
  };
  
  return langMap[extension || ""] || "plaintext";
}
