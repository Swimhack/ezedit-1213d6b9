
import { mcpFtp } from '../lib/mcpFtp';

// Mock the MCP global object
(global as any).window = {
  mcp: {
    ftp: {
      test_connection: jest.fn(),
      list_directory: jest.fn(),
      read_file: jest.fn(),
      write_file: jest.fn(),
      delete: jest.fn(),
      rename: jest.fn(),
      create_directory: jest.fn()
    }
  }
};

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

describe('MCP FTP Server Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  const mockCredentials = {
    host: 'ftp.example.com',
    port: 21,
    username: 'testuser',
    password: 'testpass',
    rootDirectory: '/'
  };
  
  test('should set credentials and test connection', async () => {
    (window.mcp.ftp.test_connection as jest.Mock).mockResolvedValue({ 
      success: true 
    });
    
    const result = await mcpFtp.setCredentials(mockCredentials);
    
    expect(result).toBe(true);
    expect(window.mcp.ftp.test_connection).toHaveBeenCalledWith({
      host: mockCredentials.host,
      port: mockCredentials.port,
      username: mockCredentials.username,
      password: mockCredentials.password,
      rootDirectory: mockCredentials.rootDirectory
    });
    expect(mcpFtp.isConnected()).toBe(true);
    expect(mcpFtp.getConnectionError()).toBe(null);
  });
  
  test('should handle connection errors', async () => {
    (window.mcp.ftp.test_connection as jest.Mock).mockResolvedValue({ 
      error: 'Connection refused' 
    });
    
    const result = await mcpFtp.setCredentials(mockCredentials);
    
    expect(result).toBe(false);
    expect(window.mcp.ftp.test_connection).toHaveBeenCalled();
    expect(mcpFtp.isConnected()).toBe(false);
    expect(mcpFtp.getConnectionError()).toBe('Connection refused');
  });
  
  test('should list directory', async () => {
    const mockFiles = [
      { name: 'file1.txt', path: '/file1.txt', isDirectory: false, size: 100, modifiedDate: '2023-01-01' },
      { name: 'folder1', path: '/folder1', isDirectory: true, size: 0, modifiedDate: '2023-01-01' }
    ];
    
    // Mock successful connection
    (window.mcp.ftp.test_connection as jest.Mock).mockResolvedValue({ success: true });
    await mcpFtp.setCredentials(mockCredentials);
    
    // Mock list directory response
    (window.mcp.ftp.list_directory as jest.Mock).mockResolvedValue({
      files: mockFiles
    });
    
    const files = await mcpFtp.listDirectory('/');
    
    expect(files).toEqual(mockFiles);
    expect(window.mcp.ftp.list_directory).toHaveBeenCalledWith({
      path: '/',
      host: mockCredentials.host,
      port: mockCredentials.port,
      username: mockCredentials.username,
      password: mockCredentials.password
    });
  });
  
  test('should read file content', async () => {
    const mockContent = 'file content';
    
    // Mock successful connection
    (window.mcp.ftp.test_connection as jest.Mock).mockResolvedValue({ success: true });
    await mcpFtp.setCredentials(mockCredentials);
    
    // Mock read file response
    (window.mcp.ftp.read_file as jest.Mock).mockResolvedValue({
      content: mockContent
    });
    
    const content = await mcpFtp.readFile('/file.txt');
    
    expect(content).toEqual(mockContent);
    expect(window.mcp.ftp.read_file).toHaveBeenCalledWith({
      path: '/file.txt',
      host: mockCredentials.host,
      port: mockCredentials.port,
      username: mockCredentials.username,
      password: mockCredentials.password
    });
  });
  
  test('should write file content', async () => {
    const content = 'new content';
    
    // Mock successful connection
    (window.mcp.ftp.test_connection as jest.Mock).mockResolvedValue({ success: true });
    await mcpFtp.setCredentials(mockCredentials);
    
    // Mock write file response
    (window.mcp.ftp.write_file as jest.Mock).mockResolvedValue({ success: true });
    
    const result = await mcpFtp.writeFile('/file.txt', content);
    
    expect(result).toBe(true);
    expect(window.mcp.ftp.write_file).toHaveBeenCalledWith({
      path: '/file.txt',
      content,
      host: mockCredentials.host,
      port: mockCredentials.port,
      username: mockCredentials.username,
      password: mockCredentials.password
    });
  });
  
  // Add more tests for other operations as needed
});
