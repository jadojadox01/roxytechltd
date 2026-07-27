import { ChevronLeftIcon, ChevronRightIcon } from "@/assets/icons";

interface TestimonialsHeaderProps {
  siteName: string;
  onPrev: () => void;
  onNext: () => void;
  isPrevDisabled: boolean;
  isNextDisabled: boolean;
}

const TestimonialsHeader = ({
  siteName,
  onPrev,
  onNext,
  isPrevDisabled,
  isNextDisabled,
}: TestimonialsHeaderProps) => {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <span className="mb-2 inline-flex items-center rounded-full bg-teal/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal">
          Testimonials
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-dark sm:text-3xl">
          What Our Customers Say
        </h2>
        <p className="mt-2 max-w-xl text-base text-dark-3">
          Real feedback from shoppers who trust {siteName} for quality products and service.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onPrev}
          className={`flex h-11 w-11 items-center justify-center rounded-full border border-gray-3 bg-white text-dark transition hover:border-teal hover:bg-teal/5 hover:text-teal ${
            isPrevDisabled ? "pointer-events-none opacity-40" : ""
          }`}
          aria-label="Previous testimonial"
          disabled={isPrevDisabled}
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>
        <button
          onClick={onNext}
          className={`flex h-11 w-11 items-center justify-center rounded-full border border-gray-3 bg-white text-dark transition hover:border-teal hover:bg-teal/5 hover:text-teal ${
            isNextDisabled ? "pointer-events-none opacity-40" : ""
          }`}
          aria-label="Next testimonial"
          disabled={isNextDisabled}
        >
          <ChevronRightIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default TestimonialsHeader;
