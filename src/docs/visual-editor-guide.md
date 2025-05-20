
# ezEdit Visual Editor Implementation Guide

## Overview

The ezEdit Visual Editor is built on GrapesJS, a powerful open-source web builder framework. This guide documents how GrapesJS is integrated within ezEdit for visual HTML editing alongside the Monaco code editor.

## Architecture

The visual editor follows these core principles:

1. **Monaco as source of truth**: The Monaco code editor remains the primary editor for all file types
2. **GrapesJS as visual alternative**: For HTML files, GrapesJS provides a WYSIWYG alternative
3. **FTP integration**: File content flows from FTP to editors and back through Edge Functions
4. **Bidirectional editing**: Changes in either editor are synced between modes

## Implementation Details

### Component Structure

- `EditorView.tsx` - Main component that switches between editor modes
- `VisualEditor.tsx` - GrapesJS wrapper component 
- `CodeEditor.tsx` - Monaco editor wrapper component
- `SplitEditor.tsx` - Container that combines editor and preview

### Data Flow

```
FTP Server <-> Supabase Edge Function <-> Monaco Editor <-> GrapesJS Editor
```

### API Routes

- `/api/load.ts` - Loads file content for GrapesJS
- `/api/save.ts` - Saves GrapesJS content back to file

### Edge Function

- `supabase/functions/grapesjs-storage/index.ts` - Handles FTP operations for GrapesJS

## Common Issues & Solutions

### "Edge Function returned a non-2xx status code"

This typically occurs when:
- The Edge Function isn't configured correctly in `supabase/config.toml`
- The function is failing to connect to the FTP server
- Error responses aren't properly formatted with 200 status codes

Solution: Always return 200 status codes from Edge Functions even for errors, with error details in the response body.

### Editor Content Not Syncing

This can happen when:
- Content format doesn't match between editors
- Event handlers aren't properly connected
- Editor instances aren't initialized or updated correctly

Solution: Implement proper content change listeners and ensure content format is consistent.

### FTP Connection Issues

When GrapesJS can't save or load files:
- Check FTP credentials access in Edge Function
- Verify file paths are correctly formatted
- Ensure temporary files are properly cleaned up

## Best Practices

1. **Error Handling**:
   - Provide clear error messages in the UI
   - Log detailed errors in the console and Edge Function logs
   - Gracefully degrade functionality when errors occur

2. **Performance**:
   - Initialize GrapesJS only once per component lifecycle
   - Use proper cleanup in useEffect returns
   - Debounce frequent operations like content syncing

3. **Security**:
   - Never expose FTP credentials in client code
   - Always use Edge Functions for server operations
   - Validate all inputs in Edge Functions

4. **UX Considerations**:
   - Provide clear loading states
   - Sync content between editors seamlessly
   - Give visual feedback for operations like save/load

## References

- [GrapesJS Documentation](https://grapesjs.com/docs/)
- [GrapesJS GitHub](https://github.com/GrapesJS/grapesjs)
- [ezEdit Documentation](internal link)

## Support

For issues with the visual editor implementation, check:
1. Edge Function logs in Supabase dashboard
2. Browser console logs
3. Network requests in browser developer tools
