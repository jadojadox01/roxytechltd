import BestSeller from "./BestSeller";
import CategoryShowcase from "./Categories/CategoryShowcase";
import CountDown from "./Countdown";
import DealsCarousel from "./DealsCarousel";
import FooterFeature from "./Hero/FooterFeature";
import Hero from "./Hero";
import NewArrival from "./NewArrivals";
import PromoBand from "./PromoBand";
import PromoSlideshow from "./PromoSlideshow";
import TrustBar from "./TrustBar";
import Newsletter from "@/components/Common/Newsletter";

const Home = () => {
  return (
    <main className="flex flex-col gap-16 pb-16 md:gap-20 lg:gap-24">
      <Hero />
      <TrustBar />
      <PromoSlideshow />
      <DealsCarousel />
      <PromoBand />
      <CategoryShowcase />
      <BestSeller />
      <CountDown />
      <NewArrival />
      <Newsletter />
      <FooterFeature />
    </main>
  );
};

export default Home;
