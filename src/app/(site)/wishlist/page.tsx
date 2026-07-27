import { createPageMetadata } from "@/lib/metadata";

import WishlistPageContent from "@/components/Wishlist/WishlistPageContent";



export async function generateMetadata() {

  return createPageMetadata("Wishlist");

}



export default function WishlistPage() {

  return (

    <main className="min-h-[80vh] bg-slate-50 py-14">

      <div className="mx-auto max-w-6xl px-4 sm:px-6">

        <div className="mb-8">

          <h1 className="text-3xl font-semibold text-slate-900">Wishlist</h1>

          <p className="mt-2 text-base text-slate-600">

            Your saved products in one place. Add them to cart when you are ready.

          </p>

        </div>

        <WishlistPageContent />

      </div>

    </main>

  );

}

