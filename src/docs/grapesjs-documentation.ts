
/**
 * GrapesJS Documentation Reference
 * 
 * This file serves as a quick reference for GrapesJS implementation in ezEdit.
 * Based on official documentation: https://grapesjs.com/docs/
 */

export const GrapesJSDocumentation = {
  /**
   * Basic initialization example
   */
  basicInit: `
import grapesjs from 'grapesjs';
import gjsPreset from 'grapesjs-preset-webpage';

const editor = grapesjs.init({
  // Mandatory: ID or element where to render the editor
  container: '#editor-container',
  
  // Whether to load content from the container
  fromElement: false,
  
  // Editor dimensions
  height: '100%',
  width: 'auto',
  
  // Storage manager configuration
  storageManager: {
    type: 'remote',           // 'local' (localStorage) or 'remote' (custom endpoint)
    autosave: false,          // Enable/disable autosaving
    autoload: true,           // Enable/disable autoloading
    stepsBeforeSave: 1,       // How many changes before saving
    options: {
      remote: {
        urlStore: '/api/save', // Endpoint for storing data
        urlLoad: '/api/load',  // Endpoint for loading data
        contentTypeJson: true, // Send data as application/json
      }
    }
  },
  
  // Plugins configuration
  plugins: [gjsPreset],       // Array of plugins
  pluginsOpts: {              // Options for plugins
    gjsPreset: {}
  }
});
`,

  /**
   * Common commands and panels configuration
   */
  commandsAndPanels: `
// Add custom command
editor.Commands.add('show-design', {
  run: editor => {
    editor.runCommand('core:open-blocks');
    editor.runCommand('core:open-layers');
    editor.stopCommand('core:open-code');
  }
});

// Configure panels and buttons
panels: {
  defaults: [
    {
      id: 'views',
      buttons: [
        {
          id: 'design-btn',
          command: 'show-design',
          active: true,
          attributes: { title: 'Switch to Design View' },
          className: 'gjs-pn-btn',
          label: 'Design',
        },
        {
          id: 'code-btn',
          command: 'show-code',
          attributes: { title: 'Switch to Code View' },
          className: 'gjs-pn-btn',
          label: 'Code',
        }
      ]
    }
  ]
}
`,

  /**
   * TypeScript augmentation for GrapesJS
   */
  typeScriptAugmentation: `
// In a separate file, e.g., grapesjs-extend.d.ts:
import 'grapesjs';

declare module 'grapesjs' {
  interface ButtonProps {
    label?: string;
  }
}
`,

  /**
   * API routes implementation for GrapesJS remote storage
   */
  apiRoutesExample: `
// For Next.js API routes or Edge Functions:

// Load endpoint (api/load.ts)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { filename, connectionId } = body;
    
    // Get file content from your storage or database
    const content = await getFileContent(filename);
    
    // Return in format GrapesJS expects
    return new Response(JSON.stringify({
      html: content,
      css: ''  // CSS content if separate
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("[API load] Error:", error);
    return new Response(JSON.stringify({ 
      html: '', css: '', error: error.message 
    }), { 
      status: 200  // Still return 200 to avoid GrapesJS errors
    });
  }
}

// Save endpoint (api/save.ts)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { html, css, filename } = body;
    
    // Save content to your storage or database
    await saveFileContent(filename, html);
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("[API save] Error:", error);
    return new Response(JSON.stringify({ 
      success: false, error: error.message 
    }), { 
      status: 200  // Still return 200 to avoid GrapesJS errors
    });
  }
}
`,

  /**
   * Common pitfalls and troubleshooting
   */
  commonPitfalls: [
    "GrapesJS requires 200 status responses even for errors to avoid breaking the editor UI",
    "Remember to initialize GrapesJS only once in React components to avoid memory leaks",
    "When working with TypeScript, you may need to augment GrapesJS types for certain properties",
    "For FTP file editing, ensure paths are correctly formatted and credentials are securely stored",
    "Always implement proper CORS headers for API routes/Edge Functions called by GrapesJS",
    "GrapesJS expects specific data formats for loading/saving (html and css properties)"
  ],

  /**
   * Official resources
   */
  resources: {
    officialDocs: "https://grapesjs.com/docs/",
    github: "https://github.com/GrapesJS/grapesjs",
    community: "https://community.grapesjs.com/",
    preset: "https://github.com/GrapesJS/preset-webpage"
  }
};

/**
 * Additional documentation for GrapesJS integration with FTP 
 * specific to ezEdit functionality
 */
export const EzEditGrapesJSNotes = {
  ftpIntegrationNotes: `
// Integration notes:
// 1. GrapesJS visual editor communicates with FTP via API routes/Edge Functions
// 2. Content flows: FTP -> API -> GrapesJS -> API -> FTP
// 3. For file edits, Monaco Editor remains source of truth
// 4. Visual Editor (GrapesJS) provides WYSIWYG alternative for HTML editing

// Implementation sequence:
// 1. User selects file in file explorer
// 2. File content loads via FTP into Monaco editor
// 3. When switching to visual mode, content transfers to GrapesJS
// 4. When saving in visual mode, content returns to Monaco and saves to FTP
`,

  bestPractices: [
    "Always check network requests when debugging GrapesJS storage issues",
    "Return 200 status even for errors to prevent GrapesJS UI from breaking",
    "Include verbose logging in API routes and Edge Functions",
    "Use Monaco Editor as the source of truth for file content",
    "Remember to clean up GrapesJS instances when components unmount to prevent memory leaks"
  ]
};

/**
 * Specific implementation details for ezEdit's GrapesJS integration
 */
export const EzEditImplementation = {
  editorInitialization: `
// In VisualEditor.tsx:
useEffect(() => {
  if (containerRef.current) {
    const editor = grapesjs.init({
      container: containerRef.current,
      height: '100%',
      width: 'auto',
      fromElement: false,
      
      storageManager: {
        type: 'remote',
        autosave: false,
        autoload: true,
        options: {
          remote: {
            urlStore: '/api/save',
            urlLoad: '/api/load',
            contentTypeJson: true,
            headers: { 'Content-Type': 'application/json' },
            onStore: data => {
              return { 
                ...data, 
                filename: fileName,
                connectionId: window.location.pathname.split('/').pop() || ''
              };
            }
          }
        }
      },
      
      plugins: [gjsPreset],
      pluginsOpts: { gjsPreset: {} }
    });

    // Custom commands, cleanup, etc.
    // ...
  }
}, []);
`,

  edgeFunctionStructure: `
// In supabase/functions/grapesjs-storage/index.ts:
import { createClient } from '@supabase/supabase-js';
import { Client } from "basic-ftp";

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  
  const body = await req.json();
  const { operation, filename, connectionId, html, css } = body;
  
  if (operation === 'load') {
    return await handleLoad(connectionId, filename);
  } else if (operation === 'save') {
    return await handleSave(connectionId, filename, html, css);
  }
  
  // Implementation of handleLoad and handleSave functions...
});
`
};
