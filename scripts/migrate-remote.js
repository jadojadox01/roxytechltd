require("dotenv").config({ path: ".env.local" });
const { execSync } = require("child_process");

console.log("Running migrations against .env.local database...");
execSync("npx prisma migrate deploy", {
  stdio: "inherit",
  env: process.env,
});
