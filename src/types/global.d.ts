
// Global type declarations for MCP (Model Context Protocol) interface
declare global {
  interface Window {
    mcp: {
      ftp: {
        test_connection: (params: {
          host: string;
          port: number;
          username: string;
          password: string;
          rootDirectory?: string;
        }) => Promise<{ success?: boolean; error?: string }>;
        
        list_directory: (params: {
          path: string;
          host: string;
          port: number;
          username: string;
          password: string;
        }) => Promise<{ files?: any[]; error?: string }>;
        
        read_file: (params: {
          path: string;
          host: string;
          port: number;
          username: string;
          password: string;
        }) => Promise<{ content?: string; error?: string }>;
        
        write_file: (params: {
          path: string;
          content: string;
          host: string;
          port: number;
          username: string;
          password: string;
        }) => Promise<{ success?: boolean; error?: string }>;
        
        delete: (params: {
          path: string;
          isDirectory?: boolean;
          host: string;
          port: number;
          username: string;
          password: string;
        }) => Promise<{ success?: boolean; error?: string }>;
        
        rename: (params: {
          oldPath: string;
          newPath: string;
          host: string;
          port: number;
          username: string;
          password: string;
        }) => Promise<{ success?: boolean; error?: string }>;
        
        create_directory: (params: {
          path: string;
          host: string;
          port: number;
          username: string;
          password: string;
        }) => Promise<{ success?: boolean; error?: string }>;
      };
    };
  }
}

export {};
