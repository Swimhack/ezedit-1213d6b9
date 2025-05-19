
# ezEdit - Web-based FTP Code Editor

A professional-grade web-based code editor for legacy websites that allows users to connect securely to FTP servers, edit live website files, and optionally enhance code through an integrated AI assistant.

## Features

- **Secure FTP Connection**: Connect to multiple FTP servers with encrypted credentials
- **Modern Split-pane Editor**: Monaco editor for code editing with syntax highlighting
- **Visual Editing**: TinyMCE WYSIWYG preview for HTML files
- **AI Assistant**: Optional code improvement suggestions via integrated AI

## Technology Stack

- React 18 with TypeScript
- Tailwind CSS for styling
- Shadcn/UI component library
- Monaco Editor for code editing
- Supabase for authentication and backend

## Project Structure

- `/src/components/ftp-explorer` - FTP file explorer components
- `/src/hooks/file-explorer` - Custom hooks for file operations
- `/src/lib` - Utility functions and shared libraries

## Getting Started

1. Clone the repository
2. Install dependencies with `npm install`
3. Run the development server with `npm run dev`
4. Build for production with `npm run build`
