import { Testimonial } from "@/types/testimonial";
import { StarIcon } from "@/assets/icons";
import Image from "next/image";

const SingleItem = ({ testimonial }: { testimonial: Testimonial }) => {
  return (
    <div className="group h-full rounded-2xl border border-gray-3 bg-white p-1 transition duration-300 hover:-translate-y-1 hover:border-teal/30 hover:shadow-lg hover:shadow-teal/5">
      <div className="flex h-full flex-col rounded-xl bg-gray-1 px-6 py-7 sm:px-8">
        <div className="mb-4 flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <StarIcon key={i} className="h-4 w-4 text-yellow" />
          ))}
        </div>

        <p className="mb-6 flex-1 text-sm leading-relaxed text-dark-3 sm:text-base">
          &ldquo;{testimonial.review}&rdquo;
        </p>

        <div className="flex items-center gap-4 border-t border-gray-3 pt-5">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full ring-2 ring-teal/20">
            <Image
              src={testimonial.authorImg}
              alt={testimonial.authorName}
              className="h-full w-full object-cover"
              width={48}
              height={48}
            />
          </div>
          <div>
            <h3 className="font-semibold text-dark">{testimonial.authorName}</h3>
            <p className="text-sm text-dark-4">{testimonial.authorRole}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleItem;
