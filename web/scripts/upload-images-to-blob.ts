/**
 * Загрузка public/images/* в Vercel Blob (pathname без random suffix).
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/upload-images-to-blob.ts
 */
import { createReadStream, readdirSync, statSync, writeFileSync } from "fs";
import path from "path";
import { put } from "@vercel/blob";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const imagesRoot = path.join(root, "public", "images");
const token = process.env.BLOB_READ_WRITE_TOKEN;

if (!token) {
  console.error("BLOB_READ_WRITE_TOKEN is missing (.env.local / Vercel env)");
  process.exit(1);
}

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

function contentType(file: string): string {
  const ext = path.extname(file).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  if (ext === ".svg") return "image/svg+xml";
  if (ext === ".mp4") return "video/mp4";
  if (ext === ".webm") return "video/webm";
  return "application/octet-stream";
}

const files = walk(imagesRoot).filter((f) => !f.includes(".DS_Store"));
console.log(`Uploading ${files.length} files from public/images → Blob…`);

const map: Record<string, string> = {};
let baseUrl = "";

for (const file of files) {
  const rel = path.relative(path.join(root, "public"), file).split(path.sep).join("/");
  // pathname: images/hero/foo.jpg
  const blob = await put(rel, createReadStream(file), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: contentType(file),
    token,
  });
  const localPath = `/${rel}`;
  map[localPath] = blob.url;
  if (!baseUrl) {
    const u = new URL(blob.url);
    // strip pathname to get origin; pathname may be /images/...
    baseUrl = u.origin;
  }
  console.log("OK", localPath, "→", blob.url);
}

const outFile = path.join(root, "scripts", "blob-assets-map.json");
writeFileSync(
  outFile,
  JSON.stringify({ baseUrl, uploadedAt: new Date().toISOString(), map }, null, 2),
);
console.log("\nNEXT_PUBLIC_BLOB_BASE_URL=" + baseUrl);
console.log("Wrote", outFile);
