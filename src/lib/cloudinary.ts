import { v2 as cloudinary } from "cloudinary";
import { getCloudinaryEnv } from "@/lib/cloudinary-env";

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

  // SDK reads CLOUDINARY_URL from the runtime environment.
  cloudinary.config({ secure: true });
  return true;
}

export { isCloudinaryReady, getMissingCloudinaryVars } from "@/lib/cloudinary-env";

export default cloudinary;
