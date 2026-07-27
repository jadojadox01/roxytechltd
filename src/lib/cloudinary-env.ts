/** Read Cloudinary env at request time (avoids Next.js build-time inlining on Vercel). */
export function getCloudinaryEnv() {
  const env = process.env;

  const cloudName = env["CLOUDINARY_CLOUD_NAME"];
  const apiKey = env["CLOUDINARY_API_KEY"];
  const apiSecret = env["CLOUDINARY_API_SECRET"];
  const cloudinaryUrl = env["CLOUDINARY_URL"];

  if (cloudName && apiKey && apiSecret) {
    return { mode: "split" as const, cloudName, apiKey, apiSecret };
  }

  if (cloudinaryUrl) {
    return { mode: "url" as const, cloudinaryUrl };
  }

  return null;
}

export function isCloudinaryReady() {
  return getCloudinaryEnv() !== null;
}

export function getMissingCloudinaryVars(): string[] {
  const env = process.env;
  if (env["CLOUDINARY_URL"]) return [];

  const missing: string[] = [];
  if (!env["CLOUDINARY_CLOUD_NAME"]) missing.push("CLOUDINARY_CLOUD_NAME");
  if (!env["CLOUDINARY_API_KEY"]) missing.push("CLOUDINARY_API_KEY");
  if (!env["CLOUDINARY_API_SECRET"]) missing.push("CLOUDINARY_API_SECRET");
  return missing;
}
