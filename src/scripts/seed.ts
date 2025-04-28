
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { readFileSync } from "fs";
import { join } from "path";

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

async function seed() {
  try {
    console.log("Seeding FTP connections...");

    // Add a sample connection
    const { data: connection, error: connectionError } = await supabase.functions.invoke("storeFtpCreds", {
      body: {
        host: "ftp.example.com",
        port: 21,
        user: "demo",
        password: "demo123",
        label: "Demo Site"
      }
    });

    if (connectionError) {
      throw connectionError;
    }

    console.log("Created connection:", connection.id);

    // Push a sample file
    const sampleHtml = readFileSync(join(__dirname, "sample-index.html"), "utf8");

    const { data: fileData, error: fileError } = await supabase.functions.invoke("saveFile", {
      body: {
        id: connection.id,
        filepath: "/index.html",
        content: sampleHtml,
        username: "seed-script"
      }
    });

    if (fileError) {
      throw fileError;
    }

    console.log("Uploaded sample file: /index.html");
    console.log("Seed completed successfully!");

  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

seed();
