import Graphics from "./Graphics";
import NewsletterForm from "./NewsletterForm";
import { TagIcon } from "@/assets/icons/home";

const Newsletter = () => {
  return (
    <section className="overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 xl:px-0">
        <div className="relative z-1 overflow-hidden rounded-2xl">
          <Graphics />

          <div className="relative flex flex-col gap-8 px-6 py-12 sm:px-10 lg:flex-row lg:items-center lg:justify-between lg:px-14 lg:py-14">
            <div className="max-w-md">
              <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                <TagIcon className="h-3.5 w-3.5" />
                Newsletter
              </span>
              <h2 className="mb-3 text-xl font-bold text-white sm:text-2xl lg:text-3xl">
                Don&apos;t Miss Out on Latest Trends & Offers
              </h2>
              <p className="text-sm text-white/80 sm:text-base">
                Subscribe to receive exclusive deals, new arrivals, and special discount codes straight to your inbox.
              </p>
            </div>

            <div className="w-full max-w-md lg:max-w-lg">
              <NewsletterForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
