import Link from "next/link";
import SectionHeader from "../shared/SectionHeader";

export default function NewArrivalTitle() {
  return (
    <SectionHeader
      eyebrow="Fresh In"
      title="New Arrivals"
      description="The latest products just landed. Be the first to get them."
      href="/shop-with-sidebar"
      linkLabel="View all"
    />
  );
}
