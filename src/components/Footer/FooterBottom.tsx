export default function FooterBottom({ siteName }: { siteName: string }) {
  const year = new Date().getFullYear();

  return (
    <div className="bg-gray-1 py-5 xl:py-7.5">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 xl:px-0">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <p className="text-sm font-normal text-dark">
            &copy; {year}. All rights reserved by {siteName}.
          </p>

          <p className="text-sm font-medium text-dark">
            We accept <span className="text-teal">Mobile Money</span>
          </p>
        </div>
      </div>
    </div>
  );
}
