const fs = require("fs");
const path = require("path");

const replacements = [
  ["Wishlist", "src/app/(site)/wishlist/page.tsx"],
  ["Terms & Conditions", "src/app/(site)/terms-conditions/page.tsx"],
  ["Shop", "src/app/(site)/shop-without-sidebar/page.tsx"],
  ["Shop", "src/app/(site)/shop-with-sidebar/page.tsx"],
  ["Privacy Policy", "src/app/(site)/privacy-policy/page.tsx"],
  ["Mail Success", "src/app/(site)/mail-success/page.tsx"],
  ["Error", "src/app/(site)/error/page.tsx"],
  ["Contact Us", "src/app/(site)/contact/page.tsx"],
  ["Checkout", "src/app/(site)/checkout/page.tsx"],
  ["Blog Grid with Sidebar", "src/app/(site)/blogs/blog-grid-with-sidebar/page.tsx"],
  ["Blog Grid", "src/app/(site)/blogs/blog-grid/page.tsx"],
  ["Blog Details with Sidebar", "src/app/(site)/blogs/blog-details-with-sidebar/page.tsx"],
  ["Blog Details", "src/app/(site)/blogs/blog-details/page.tsx"],
  ["Operations Dashboard", "src/app/storekeeper/dashboard/page.tsx"],
  ["Products", "src/app/storekeeper/products/page.tsx"],
  ["Orders", "src/app/storekeeper/orders/page.tsx"],
  ["Inventory", "src/app/storekeeper/inventory/page.tsx"],
  ["Inventory Management", "src/app/admin/inventory/page.tsx"],
  ["Activity Log", "src/app/admin/activities/page.tsx"],
  ["User Management", "src/app/admin/users/page.tsx"],
  ["Deals of the Day", "src/app/admin/deals/page.tsx"],
  ["My Account", "src/app/user/my-account/page.tsx"],
];

const root = path.join(__dirname, "..");

for (const [title, relPath] of replacements) {
  const filePath = path.join(root, relPath);
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, "utf8");
  const metadataRegex = /export const metadata: Metadata = \{\s*title: "[^"]+",?\s*\};\s*\n/;

  if (!metadataRegex.test(content)) continue;

  content = content.replace(
    /import type \{ Metadata \} from "next";\n/,
    ""
  );
  if (!content.includes('createPageMetadata')) {
    content = `import { createPageMetadata } from "@/lib/metadata";\n${content}`;
  }

  content = content.replace(
    metadataRegex,
    `export async function generateMetadata() {\n  return createPageMetadata("${title}");\n}\n\n`
  );

  fs.writeFileSync(filePath, content);
  console.log("Updated", relPath);
}
