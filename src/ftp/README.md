
# FTP Mode Setup & Usage

## Overview

EzEdit supports both local filesystem and FTP server editing modes. FTP mode allows users to connect to remote FTP servers and edit files directly.

## Setup

1. **Install Dependencies**

   ```bash
   npm install @modelcontextprotocol/server-ftp
   ```

2. **Configure MCP**

   The `mcp_config.json` file should include the FTP server configuration:

   ```json
   {
     "version": 1,
     "servers": {
       "localfs": {
         "command": "npx",
         "args": ["-y", "@modelcontextprotocol/server-fs"]
       },
       "ftp": {
         "command": "npx",
         "args": ["-y", "@modelcontextprotocol/server-ftp"]
       }
     }
   }
   ```

3. **FTP Credentials**

   FTP credentials are stored in the `sites.json` file in the user's home directory. The format is:

   ```json
   {
     "sites": [
       {
         "id": "unique-id",
         "site_name": "My FTP Site",
         "server_url": "ftp.example.com",
         "port": 21,
         "username": "username",
         "password": "password",
         "root_directory": "/"
       }
     ]
   }
   ```

## Usage

1. **Mode Selection**

   Use the Mode Toggle in the editor interface to switch between Local and FTP modes.

2. **FTP Connection**

   When in FTP mode, select an FTP site from the dropdown menu to connect. The file explorer will display the remote directory structure.

3. **File Operations**

   - **Browse**: Navigate through directories in the file explorer
   - **Edit**: Click on a file to open it in the editor
   - **Save**: Changes are saved back to the FTP server
   - **Create/Delete**: Create new files/folders or delete existing ones

4. **Switching Modes**

   The editor will remember the last path for both local and FTP modes, making it easy to switch between them.

## Error Handling

- Connection errors are displayed with helpful messages
- Failed operations provide clear error notifications
- Auto-reconnect attempts are made when the connection is lost

## Limitations

- Binary files are not supported for editing
- Large file transfers may experience timeout issues
- Some FTP servers may have restrictions on certain operations

## Troubleshooting

If you encounter connection issues:

1. Verify network connectivity
2. Check credentials (username/password)
3. Ensure the FTP server allows external connections
4. Check if the server requires passive mode (supported)
5. Look for firewall restrictions that might block FTP traffic

## Implementation Details

The FTP mode implementation uses the MCP protocol with the `@modelcontextprotocol/server-ftp` package to handle FTP operations. File data is transferred through the MCP bridge, ensuring secure and reliable communication.

