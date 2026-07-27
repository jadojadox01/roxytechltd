import { promises as fs } from "fs";
import path from "path";

export async function saveLocalImage(
  file: File,
  folder: string,
  prefix: string
): Promise<string> {
  const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
  await fs.mkdir(uploadDir, { recursive: true });

  const ext = path.extname(file.name || ".jpg") || ".jpg";
  const safeName = `${prefix}-${Date.now()}${ext}`;
  await fs.writeFile(
    path.join(uploadDir, safeName),
    Buffer.from(await file.arrayBuffer())
  );

  return `/uploads/${folder}/${safeName}`;
}

export function isCloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}
