
import { toast } from "sonner";

// Interface for FTP credentials
interface FtpCredentials {
  host: string;
  port: number;
  username: string;
  password: string;
  rootDirectory?: string;
}

// Interface for file information returned by list_directory
interface FtpFileInfo {
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
  modifiedDate: string;
}

/**
 * MCP FTP Server wrapper
 * Handles communication with the FTP server via Model Context Protocol
 */
class McpFtp {
  private credentials: FtpCredentials | null = null;
  private connected: boolean = false;
  private connectionError: string | null = null;
  
  /**
   * Set FTP credentials and initialize connection
   */
  async setCredentials(creds: FtpCredentials): Promise<boolean> {
    this.credentials = creds;
    this.connectionError = null;
    
    try {
      console.log("[McpFtp] Setting credentials for", creds.host);
      
      // Call the MCP FTP server to initialize connection
      const response = await window.mcp.ftp.test_connection({
        host: creds.host,
        port: creds.port || 21,
        username: creds.username,
        password: creds.password,
        rootDirectory: creds.rootDirectory || '/'
      });
      
      if (response.error) {
        this.connected = false;
        this.connectionError = response.error;
        console.error("[McpFtp] Connection error:", response.error);
        toast.error(`FTP connection failed: ${response.error}`);
        return false;
      }
      
      this.connected = true;
      console.log("[McpFtp] Connection successful");
      toast.success("FTP connection established");
      return true;
    } catch (error: any) {
      this.connected = false;
      this.connectionError = error.message || "Unknown connection error";
      console.error("[McpFtp] Connection exception:", error);
      toast.error(`FTP connection error: ${error.message}`);
      return false;
    }
  }
  
  /**
   * Check if currently connected
   */
  isConnected(): boolean {
    return this.connected;
  }
  
  /**
   * Get connection error if any
   */
  getConnectionError(): string | null {
    return this.connectionError;
  }
  
  /**
   * List directory contents
   */
  async listDirectory(path: string): Promise<FtpFileInfo[]> {
    if (!this.isConnected() || !this.credentials) {
      throw new Error("Not connected to FTP server");
    }
    
    try {
      console.log("[McpFtp] Listing directory:", path);
      
      const response = await window.mcp.ftp.list_directory({
        path,
        host: this.credentials.host,
        port: this.credentials.port || 21,
        username: this.credentials.username,
        password: this.credentials.password
      });
      
      if (response.error) {
        console.error("[McpFtp] List directory error:", response.error);
        toast.error(`Failed to list directory: ${response.error}`);
        throw new Error(response.error);
      }
      
      return response.files || [];
    } catch (error: any) {
      console.error("[McpFtp] List directory exception:", error);
      toast.error(`Failed to list directory: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Read file content
   */
  async readFile(path: string): Promise<string> {
    if (!this.isConnected() || !this.credentials) {
      throw new Error("Not connected to FTP server");
    }
    
    try {
      console.log("[McpFtp] Reading file:", path);
      
      const response = await window.mcp.ftp.read_file({
        path,
        host: this.credentials.host,
        port: this.credentials.port || 21,
        username: this.credentials.username,
        password: this.credentials.password
      });
      
      if (response.error) {
        console.error("[McpFtp] Read file error:", response.error);
        toast.error(`Failed to read file: ${response.error}`);
        throw new Error(response.error);
      }
      
      return response.content || "";
    } catch (error: any) {
      console.error("[McpFtp] Read file exception:", error);
      toast.error(`Failed to read file: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Write file content
   */
  async writeFile(path: string, content: string): Promise<boolean> {
    if (!this.isConnected() || !this.credentials) {
      throw new Error("Not connected to FTP server");
    }
    
    try {
      console.log("[McpFtp] Writing file:", path);
      
      const response = await window.mcp.ftp.write_file({
        path,
        content,
        host: this.credentials.host,
        port: this.credentials.port || 21,
        username: this.credentials.username,
        password: this.credentials.password
      });
      
      if (response.error) {
        console.error("[McpFtp] Write file error:", response.error);
        toast.error(`Failed to write file: ${response.error}`);
        throw new Error(response.error);
      }
      
      return true;
    } catch (error: any) {
      console.error("[McpFtp] Write file exception:", error);
      toast.error(`Failed to write file: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Delete file or directory
   */
  async delete(path: string, isDirectory: boolean = false): Promise<boolean> {
    if (!this.isConnected() || !this.credentials) {
      throw new Error("Not connected to FTP server");
    }
    
    try {
      console.log("[McpFtp] Deleting:", path, isDirectory ? "(directory)" : "(file)");
      
      const response = await window.mcp.ftp.delete({
        path,
        isDirectory,
        host: this.credentials.host,
        port: this.credentials.port || 21,
        username: this.credentials.username,
        password: this.credentials.password
      });
      
      if (response.error) {
        console.error("[McpFtp] Delete error:", response.error);
        toast.error(`Failed to delete: ${response.error}`);
        throw new Error(response.error);
      }
      
      return true;
    } catch (error: any) {
      console.error("[McpFtp] Delete exception:", error);
      toast.error(`Failed to delete: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Rename or move file/directory
   */
  async rename(oldPath: string, newPath: string): Promise<boolean> {
    if (!this.isConnected() || !this.credentials) {
      throw new Error("Not connected to FTP server");
    }
    
    try {
      console.log("[McpFtp] Renaming:", oldPath, "to", newPath);
      
      const response = await window.mcp.ftp.rename({
        oldPath,
        newPath,
        host: this.credentials.host,
        port: this.credentials.port || 21,
        username: this.credentials.username,
        password: this.credentials.password
      });
      
      if (response.error) {
        console.error("[McpFtp] Rename error:", response.error);
        toast.error(`Failed to rename: ${response.error}`);
        throw new Error(response.error);
      }
      
      return true;
    } catch (error: any) {
      console.error("[McpFtp] Rename exception:", error);
      toast.error(`Failed to rename: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Create a new directory
   */
  async createDirectory(path: string): Promise<boolean> {
    if (!this.isConnected() || !this.credentials) {
      throw new Error("Not connected to FTP server");
    }
    
    try {
      console.log("[McpFtp] Creating directory:", path);
      
      const response = await window.mcp.ftp.create_directory({
        path,
        host: this.credentials.host,
        port: this.credentials.port || 21,
        username: this.credentials.username,
        password: this.credentials.password
      });
      
      if (response.error) {
        console.error("[McpFtp] Create directory error:", response.error);
        toast.error(`Failed to create directory: ${response.error}`);
        throw new Error(response.error);
      }
      
      return true;
    } catch (error: any) {
      console.error("[McpFtp] Create directory exception:", error);
      toast.error(`Failed to create directory: ${error.message}`);
      throw error;
    }
  }
}

// Export singleton instance
export const mcpFtp = new McpFtp();
