
import { Client } from "basic-ftp";

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
    const stream = await this.client.downloadTo(Buffer.alloc(0), path);
    // if downloadTo into a buffer isn't available, use downloadToTemp or similar,
    // then read that temp file back into a string.
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk as Buffer);
    }
    await this.client.close();
    return Buffer.concat(chunks).toString("utf-8");
  }

  // You can also add .put(path, data) for saving files back to FTP.
}

export default new FTPConnector();
