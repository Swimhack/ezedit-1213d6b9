
import { Client } from "basic-ftp";
import { Writable } from "stream";

class FTPConnector {
  private client: Client;

  constructor() {
    this.client = new Client();
    // optional: this.client.ftp.verbose = true;
  }

  async get(path: string): Promise<string> {
    await this.client.access({
      host: process.env.FTP_HOST!,
      user: process.env.FTP_USER!,
      password: process.env.FTP_PASS!,
      secure: false,    // or true for FTPS
    });
    
    // Create a buffer to collect data
    const chunks: Buffer[] = [];
    
    // Create a writable stream that collects data into chunks
    const writable = new Writable({
      write(chunk, encoding, callback) {
        chunks.push(Buffer.from(chunk));
        callback();
      }
    });
    
    // Download file to the writable stream
    await this.client.downloadTo(writable, path);
    await this.client.close();
    
    // Concatenate all chunks and convert to string
    return Buffer.concat(chunks).toString("utf-8");
  }

  // You can also add .put(path, data) for saving files back to FTP.
}

export default new FTPConnector();
