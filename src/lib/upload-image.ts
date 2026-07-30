import { promises as fs } from "fs";
import path from "path";
import { Readable } from "stream";
import cloudinary, { configureCloudinary, isCloudinaryReady } from "@/lib/cloudinary";
import { getMissingCloudinaryVars } from "@/lib/cloudinary-env";

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
  return isCloudinaryReady();
}

function uploadBufferToCloudinary(buffer: Buffer, folder: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `roxytech/${folder}`,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        if (!result?.secure_url) {
          reject(new Error("Cloudinary upload did not return a URL"));
          return;
        }
        resolve(result.secure_url);
      }
    );

    Readable.from(buffer).pipe(stream);
  });
}

export async function uploadImageFile(
  file: File,
  folder: string,
  prefix: string
): Promise<string> {
  if (!file.size) {
    throw new Error("Image file is empty");
  }

  const isProd = Boolean(process.env["VERCEL"]) || process.env["NODE_ENV"] === "production";
  const buffer = Buffer.from(await file.arrayBuffer());

  if (isCloudinaryReady() && configureCloudinary()) {
    try {
      return await uploadBufferToCloudinary(buffer, folder);
    } catch (err) {
      console.error("[uploadImageFile] Cloudinary failed:", err);
      if (isProd) {
        throw new Error(
          err instanceof Error
            ? `Image upload failed: ${err.message}`
            : "Cloudinary upload failed"
        );
      }
      // Local/dev fallback so admin can keep working offline
    }
  } else if (isProd) {
    const missing = getMissingCloudinaryVars();
    throw new Error(
      missing.length
        ? `Cloudinary is not configured (missing ${missing.join(", ")}). Add them in Vercel → Settings → Environment Variables, then redeploy.`
        : "Cloudinary is not available on the server."
    );
  }

  return saveLocalImage(file, folder, prefix);
}
