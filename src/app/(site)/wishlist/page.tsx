import { createPageMetadata } from "@/lib/metadata";

import WishlistPageContent from "@/components/Wishlist/WishlistPageContent";



export async function generateMetadata() {

  return createPageMetadata("Wishlist");

}



export default function WishlistPage() {

  return (

    <main className="min-h-[80vh] bg-slate-50 py-14">

      <div className="mx-auto max-w-6xl px-4 sm:px-6">

        <div className="mb-8 rounded-3xl border border-[#e0e7ff] bg-gradient-to-r from-[#1a255f] to-[#24337f] p-6 text-white shadow-sm sm:p-8">
          <p className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-white/90">
            Saved for later
          </p>
          <h1 className="mt-4 text-3xl font-black">Wishlist</h1>
          <p className="mt-2 text-base text-white/85">
            Your saved products in one place. Add them to cart when you are ready.
          </p>
        </div>

        <WishlistPageContent />

      </div>

    </main>

  );

}

