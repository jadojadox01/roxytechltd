import { promises as fs } from "fs";
import path from "path";
import cloudinary, { configureCloudinary, isCloudinaryReady } from "@/lib/cloudinary";

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

export async function uploadImageFile(
  file: File,
  folder: string,
  prefix: string
): Promise<string> {
  if (!file.size) {
    throw new Error("Image file is empty");
  }

  if (isCloudinaryReady() && configureCloudinary()) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const mime = file.type || "image/jpeg";
    const dataUri = `data:${mime};base64,${buffer.toString("base64")}`;

    const uploaded = await cloudinary.uploader.upload(dataUri, {
      folder: `roxytech/${folder}`,
      resource_type: "image",
    });

    if (!uploaded.secure_url) {
      throw new Error("Cloudinary upload did not return a URL");
    }

    return uploaded.secure_url;
  }

  if (process.env["VERCEL"] || process.env["NODE_ENV"] === "production") {
    throw new Error(
      "Cloudinary is not available on the server. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in Vercel, then redeploy."
    );
  }

  return saveLocalImage(file, folder, prefix);
}
