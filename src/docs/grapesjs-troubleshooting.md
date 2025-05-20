
# GrapesJS Integration Troubleshooting Guide

## Common Errors and Solutions

### "Failed to load files: Edge Function returned a non-2xx status code."

This error occurs when GrapesJS's storage manager fails to load or save content.

**Possible causes and solutions:**

1. **Edge Function not configured correctly**
   - Check that `grapesjs-storage` function is enabled in `supabase/config.toml`
   - Verify JWT verification settings in config.toml

2. **FTP connection issues**
   - Ensure FTP credentials are correct in the database
   - Check FTP server is accessible from Edge Functions
   - Verify file paths are correctly formatted

3. **API Route configuration**
   - Ensure `/api/load.ts` and `/api/save.ts` are returning 200 status codes
   - Check that CORS headers are properly configured

4. **Error response handling**
   - GrapesJS requires 200 status codes even for errors
   - Modify edge function to return 200 status with error details in body

### GrapesJS Editor Not Initializing

**Possible causes and solutions:**

1. **DOM container not ready**
   - Ensure container ref exists before initializing
   - Move initialization to useEffect with proper dependencies

2. **Missing CSS**
   - Check that GrapesJS CSS is properly imported

3. **Plugin configuration**
   - Verify plugins are properly installed and configured

### Content Not Syncing Between Editors

**Possible causes and solutions:**

1. **Event listeners not set up**
   - Ensure content change events are properly connected
   - Verify state updates are triggering re-renders

2. **Content format mismatch**
   - Ensure content format is consistent between editors
   - Check for encoding issues in content

## Debugging Strategies

### 1. Check Edge Function Logs

```
supabase functions logs grapesjs-storage
```

### 2. Monitor Network Requests

- Open browser dev tools
- Go to Network tab
- Filter for `/api/load` and `/api/save` requests
- Check request and response bodies

### 3. Add Debug Logging

Add console logs at key points in the code:

```javascript
console.log('[VisualEditor] Initializing with content:', content?.substring(0, 100) + '...');
console.log('[VisualEditor] StorageManager configuration:', { /* config */ });
console.log('[API load] Request body:', body);
```

### 4. Test API Routes Directly

Use tools like Postman to test API routes directly:

```
POST /api/load
Body: {
  "filename": "index.html",
  "connectionId": "your-connection-id"
}
```

## Reference Documentation

- [GrapesJS Storage Module](https://grapesjs.com/docs/modules/Storage.html)
- [GrapesJS Official Documentation](https://grapesjs.com/docs/)
- [Basic FTP Documentation](https://github.com/patrickjuchli/basic-ftp)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
