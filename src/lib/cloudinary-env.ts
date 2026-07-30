/** Read Cloudinary env at request time (avoids Next.js build-time inlining on Vercel). */
function clean(value: string | undefined) {
  return value?.trim() || "";
}

export function getCloudinaryEnv() {
  const env = process.env;

  const cloudName = clean(env["CLOUDINARY_CLOUD_NAME"]);
  const apiKey = clean(env["CLOUDINARY_API_KEY"]);
  const apiSecret = clean(env["CLOUDINARY_API_SECRET"]);
  const cloudinaryUrl = clean(env["CLOUDINARY_URL"]);

  // Prefer a single CLOUDINARY_URL when present — avoids mismatched split vars on Vercel.
  if (cloudinaryUrl) {
    return { mode: "url" as const, cloudinaryUrl };
  }

  if (cloudName && apiKey && apiSecret) {
    return { mode: "split" as const, cloudName, apiKey, apiSecret };
  }

  return null;
}

export function isCloudinaryReady() {
  return getCloudinaryEnv() !== null;
}

export function getMissingCloudinaryVars(): string[] {
  const env = process.env;
  if (clean(env["CLOUDINARY_URL"])) return [];

  const missing: string[] = [];
  if (!clean(env["CLOUDINARY_CLOUD_NAME"])) missing.push("CLOUDINARY_CLOUD_NAME");
  if (!clean(env["CLOUDINARY_API_KEY"])) missing.push("CLOUDINARY_API_KEY");
  if (!clean(env["CLOUDINARY_API_SECRET"])) missing.push("CLOUDINARY_API_SECRET");
  return missing;
}
