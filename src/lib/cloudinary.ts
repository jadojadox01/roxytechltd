import { v2 as cloudinary } from "cloudinary";

function hasSplitCloudinaryEnv() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

if (hasSplitCloudinaryEnv()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
} else if (process.env.CLOUDINARY_URL) {
  // Let the SDK read CLOUDINARY_URL from the environment.
  cloudinary.config({ secure: true });
}

export default cloudinary;

export function isCloudinaryReady() {
  return hasSplitCloudinaryEnv() || Boolean(process.env.CLOUDINARY_URL);
}
