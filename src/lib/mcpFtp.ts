
// Enhanced MCP FTP client with better error handling and logging

class MCPFTPClient {
  private connectionParams: any = null;
  private connectionError: string | null = null;

  async setCredentials(params: {
    host: string;
    port: number;
    username: string;
    password: string;
    rootDirectory?: string;
  }): Promise<boolean> {
    try {
      console.log(`[MCPFTPClient] Setting credentials for ${params.host}:${params.port}`);
      
      if (typeof window === 'undefined' || !window.mcp?.ftp) {
        console.warn('[MCPFTPClient] MCP FTP not available, using mock mode');
        this.connectionParams = params;
        this.connectionError = null;
        return true;
      }

      const result = await window.mcp.ftp.test_connection({
        host: params.host,
        port: params.port,
        username: params.username,
        password: params.password,
        rootDirectory: params.rootDirectory
      });

      if (result.success) {
        this.connectionParams = params;
        this.connectionError = null;
        console.log('[MCPFTPClient] Connection established successfully');
        return true;
      } else {
        this.connectionError = result.error || 'Connection failed';
        console.error('[MCPFTPClient] Connection failed:', this.connectionError);
        return false;
      }
    } catch (error: any) {
      this.connectionError = error.message || 'Connection error';
      console.error('[MCPFTPClient] Error setting credentials:', error);
      return false;
    }
  }

  async listDirectory(path: string): Promise<any[]> {
    if (!this.connectionParams) {
      throw new Error('No FTP connection established');
    }

    try {
      console.log(`[MCPFTPClient] Listing directory: ${path}`);
      
      if (typeof window === 'undefined' || !window.mcp?.ftp) {
        console.warn('[MCPFTPClient] Using mock directory listing');
        // Return mock data for development
        return [
          { name: 'index.html', path: `${path}index.html`, isDirectory: false, size: 1024, modifiedDate: new Date() },
          { name: 'css', path: `${path}css/`, isDirectory: true, size: 0, modifiedDate: new Date() },
          { name: 'js', path: `${path}js/`, isDirectory: true, size: 0, modifiedDate: new Date() },
          { name: 'images', path: `${path}images/`, isDirectory: true, size: 0, modifiedDate: new Date() }
        ];
      }

      const result = await window.mcp.ftp.list_directory({
        path: path,
        host: this.connectionParams.host,
        port: this.connectionParams.port,
        username: this.connectionParams.username,
        password: this.connectionParams.password
      });

      if (result.error) {
        throw new Error(result.error);
      }

      return result.files || [];
    } catch (error: any) {
      console.error('[MCPFTPClient] Error listing directory:', error);
      throw error;
    }
  }

  async readFile(path: string): Promise<string> {
    if (!this.connectionParams) {
      throw new Error('No FTP connection established');
    }

    try {
      console.log(`[MCPFTPClient] Reading file: ${path}`);
      
      if (typeof window === 'undefined' || !window.mcp?.ftp) {
        console.warn('[MCPFTPClient] Using mock file content');
        return `<!-- Mock content for ${path} -->\n<html>\n<head><title>Mock File</title></head>\n<body>\n<h1>This is mock content</h1>\n</body>\n</html>`;
      }

      const result = await window.mcp.ftp.read_file({
        path: path,
        host: this.connectionParams.host,
        port: this.connectionParams.port,
        username: this.connectionParams.username,
        password: this.connectionParams.password
      });

      if (result.error) {
        throw new Error(result.error);
      }

      return result.content || '';
    } catch (error: any) {
      console.error('[MCPFTPClient] Error reading file:', error);
      throw error;
    }
  }

  async writeFile(path: string, content: string): Promise<boolean> {
    if (!this.connectionParams) {
      throw new Error('No FTP connection established');
    }

    try {
      console.log(`[MCPFTPClient] Writing file: ${path}, content length: ${content.length}`);
      
      if (typeof window === 'undefined' || !window.mcp?.ftp) {
        console.warn('[MCPFTPClient] Using mock file write');
        return true;
      }

      const result = await window.mcp.ftp.write_file({
        path: path,
        content: content,
        host: this.connectionParams.host,
        port: this.connectionParams.port,
        username: this.connectionParams.username,
        password: this.connectionParams.password
      });

      if (result.error) {
        throw new Error(result.error);
      }

      return result.success || false;
    } catch (error: any) {
      console.error('[MCPFTPClient] Error writing file:', error);
      throw error;
    }
  }

  getConnectionError(): string | null {
    return this.connectionError;
  }

  isConnected(): boolean {
    return this.connectionParams !== null && this.connectionError === null;
  }
}

export const mcpFtp = new MCPFTPClient();
