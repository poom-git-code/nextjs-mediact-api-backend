import fs from "fs";
import path from "path";
import os from "os";

export function ensureGoogleCredentialsFile() {
  const json = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (!json) return;

  // ใช้ temporary directory ที่เหมาะสมกับแต่ละ OS
  const tempDir = os.tmpdir();
  console.log("Temporary directory for Google credentials:", tempDir);
  const tempPath = path.join(tempDir, "service-account.json");
  console.log("Temporary path for Google credentials:", tempPath);
  
  try {
    fs.writeFileSync(tempPath, json);
    process.env.GOOGLE_APPLICATION_CREDENTIALS = tempPath;
    console.log(`Google credentials written to: ${tempPath}`);
  } catch (error) {
    console.error("Failed to write Google credentials file:", error);
  }
}
