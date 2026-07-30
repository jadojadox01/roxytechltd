import { v2 as cloudinary } from "cloudinary";
import { getCloudinaryEnv } from "@/lib/cloudinary-env";

function parseCloudinaryUrl(url: string) {
  try {
    const parsed = new URL(url);
    const cloudName = parsed.hostname;
    const apiKey = decodeURIComponent(parsed.username || "");
    const apiSecret = decodeURIComponent(parsed.password || "");
    if (cloudName && apiKey && apiSecret) {
      return { cloudName, apiKey, apiSecret };
    }
  } catch {
    // ignore malformed URL
  }
  return null;
}

export function configureCloudinary(): boolean {
  const config = getCloudinaryEnv();
  if (!config) return false;

  if (config.mode === "split") {
    cloudinary.config({
      cloud_name: config.cloudName,
      api_key: config.apiKey,
      api_secret: config.apiSecret,
      secure: true,
    });
    return true;
  }

  const fromUrl = parseCloudinaryUrl(config.cloudinaryUrl);
  if (fromUrl) {
    cloudinary.config({
      cloud_name: fromUrl.cloudName,
      api_key: fromUrl.apiKey,
      api_secret: fromUrl.apiSecret,
      secure: true,
    });
    return true;
  }

  // Last resort: let the SDK read CLOUDINARY_URL from process.env
  process.env.CLOUDINARY_URL = config.cloudinaryUrl;
  cloudinary.config(true);
  return true;
}

export { isCloudinaryReady, getMissingCloudinaryVars } from "@/lib/cloudinary-env";

export default cloudinary;
