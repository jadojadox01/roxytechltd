import { revalidatePath, revalidateTag } from "next/cache";

/** Clear storefront + admin product caches after create/update/delete */
export function revalidateProductCaches() {
  revalidateTag("products", "max");
  revalidateTag("categories", "max");
  revalidateTag("deal-products", "max");
  revalidateTag("related-products", "max");

  revalidatePath("/", "layout");
  revalidatePath("/shop-with-sidebar");
  revalidatePath("/shop-without-sidebar");
  revalidatePath("/admin/products");
}
