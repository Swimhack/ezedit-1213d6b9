
#!/usr/bin/env ts-node
// This script seeds the database with initial data

import { config } from "dotenv";
import fetch from "node-fetch";

// Load environment variables from .env
config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables");
  process.exit(1);
}

async function seed() {
  try {
    console.log("Seeding database...");
    
    // Store FTP credentials
    const response = await fetch(`${SUPABASE_URL}/functions/v1/storeFtpCreds`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        host: process.env.FTP_HOST || "localhost",
        port: parseInt(process.env.FTP_PORT || "21"),
        user: process.env.FTP_USER || "demo",
        password: process.env.FTP_PASSWORD || "demo",
        label: "Demo Server"
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to store FTP credentials: ${await response.text()}`);
    }
    
    const { id } = await response.json();
    console.log(`Created FTP connection with ID: ${id}`);
    
    // Upload sample index.html
    const sampleHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ezEdit Demo</title>
  <style>
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      line-height: 1.6;
    }
    h1 { color: #0070f3; }
    .card {
      border: 1px solid #eaeaea;
      border-radius: 10px;
      padding: 1.5rem;
      margin: 1rem 0;
      background: #f9f9f9;
    }
  </style>
</head>
<body>
  <h1>Welcome to ezEdit!</h1>
  <p>This is a sample page created by the seed script.</p>
  
  <div class="card">
    <h2>Edit me!</h2>
    <p>You can edit this file using the ezEdit FTP editor.</p>
    <p>Make changes and save them back to your FTP server.</p>
  </div>
  
  <footer>
    <p>Created at: ${new Date().toISOString()}</p>
  </footer>
</body>
</html>`;

    const saveResponse = await fetch(`${SUPABASE_URL}/functions/v1/saveFile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        id,
        filepath: "/index.html",
        content: sampleHTML,
        username: "seed-script"
      })
    });
    
    if (!saveResponse.ok) {
      throw new Error(`Failed to save sample file: ${await saveResponse.text()}`);
    }
    
    console.log("Successfully uploaded sample index.html");
    console.log("Seeding completed successfully!");
    
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seed();
