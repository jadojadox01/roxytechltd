require("dotenv").config({ path: ".env.local" });
const { execSync } = require("child_process");

console.log("Syncing schema to .env.local database (db push)...");
execSync("npx prisma db push --accept-data-loss", {
  stdio: "inherit",
  env: process.env,
});
