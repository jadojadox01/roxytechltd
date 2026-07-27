import { promises as fs } from "fs";
import path from "path";
import cloudinary from "@/lib/cloudinary";

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

export async function uploadImageFile(
  file: File,
  folder: string,
  prefix: string
): Promise<string> {
  if (!file.size) {
    throw new Error("Image file is empty");
  }

  if (isCloudinaryConfigured()) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded: { secure_url?: string } = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: `roxytech/${folder}` },
        (error, result) => {
          if (error) reject(error);
          else resolve(result ?? {});
        }
      );
      stream.end(buffer);
    });

    if (uploaded.secure_url) {
      return uploaded.secure_url;
    }

    throw new Error("Cloudinary upload did not return a URL");
  }

  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    throw new Error(
      "Image uploads on Vercel require Cloudinary. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in Vercel environment variables, then redeploy."
    );
  }

  return saveLocalImage(file, folder, prefix);
}
