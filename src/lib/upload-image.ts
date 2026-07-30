import { promises as fs } from "fs";
import path from "path";
import cloudinary, { configureCloudinary, isCloudinaryReady } from "@/lib/cloudinary";
import { getMissingCloudinaryVars } from "@/lib/cloudinary-env";

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

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

function extractErrorMessage(err: unknown): string {
  if (!err) return "Cloudinary upload failed";
  if (typeof err === "string") return err;
  if (err instanceof Error && err.message) return err.message;

  if (typeof err === "object") {
    const anyErr = err as {
      message?: unknown;
      error?: { message?: unknown };
      http_code?: unknown;
    };
    const nested =
      (typeof anyErr.message === "string" && anyErr.message) ||
      (typeof anyErr.error?.message === "string" && anyErr.error.message) ||
      null;
    if (nested) {
      return anyErr.http_code ? `${nested} (HTTP ${anyErr.http_code})` : nested;
    }
  }

  try {
    return JSON.stringify(err);
  } catch {
    return "Cloudinary upload failed";
  }
}

function uploadBufferViaStream(buffer: Buffer, folder: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `roxytech/${folder}`,
        resource_type: "image",
        overwrite: false,
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

    // Prefer end(buffer) over Readable.pipe — more reliable on Vercel serverless.
    stream.end(buffer);
  });
}

async function uploadBufferViaDataUri(
  buffer: Buffer,
  folder: string,
  mime: string
): Promise<string> {
  const dataUri = `data:${mime || "image/jpeg"};base64,${buffer.toString("base64")}`;
  const uploaded = await cloudinary.uploader.upload(dataUri, {
    folder: `roxytech/${folder}`,
    resource_type: "image",
    overwrite: false,
  });

  if (!uploaded?.secure_url) {
    throw new Error("Cloudinary upload did not return a URL");
  }

  return uploaded.secure_url;
}

async function uploadToCloudinary(
  buffer: Buffer,
  folder: string,
  mime: string
): Promise<string> {
  try {
    return await uploadBufferViaStream(buffer, folder);
  } catch (streamError) {
    console.error("[uploadImageFile] stream upload failed, trying data URI:", streamError);
    return uploadBufferViaDataUri(buffer, folder, mime);
  }
}

export async function uploadImageFile(
  file: File,
  folder: string,
  prefix: string
): Promise<string> {
  if (!file.size) {
    throw new Error("Image file is empty");
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("Image is too large. Please upload an image under 8MB.");
  }

  const isProd = Boolean(process.env["VERCEL"]) || process.env["NODE_ENV"] === "production";
  const buffer = Buffer.from(await file.arrayBuffer());
  const mime = file.type || "image/jpeg";

  if (isCloudinaryReady() && configureCloudinary()) {
    try {
      return await uploadToCloudinary(buffer, folder, mime);
    } catch (err) {
      const details = extractErrorMessage(err);
      console.error("[uploadImageFile] Cloudinary failed:", details, err);
      if (isProd) {
        throw new Error(`Image upload failed: ${details}`);
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
