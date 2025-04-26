
/**
 * Utility function to determine the language for the code editor based on file extension
 */
export function getLanguageFromFileName(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase() || '';

  const languageMap: Record<string, string> = {
    // Web languages
    'html': 'html',
    'htm': 'html',
    'xhtml': 'html',
    'css': 'css',
    'scss': 'scss',
    'less': 'less',
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'json': 'json',

    // Server-side languages
    'php': 'php',
    'py': 'python',
    'rb': 'ruby',
    'java': 'java',
    'c': 'c',
    'cpp': 'cpp',
    'cs': 'csharp',
    'go': 'go',
    'rs': 'rust',

    // Configuration & markup
    'xml': 'xml',
    'svg': 'xml',
    'yml': 'yaml',
    'yaml': 'yaml',
    'md': 'markdown',
    'sql': 'sql',
    'sh': 'shell',
    'bash': 'shell',
    'ini': 'ini',
    'toml': 'toml',
    'htaccess': 'apache',
    
    // Default
    'txt': 'plaintext',
  };

  return languageMap[extension] || 'plaintext';
}
