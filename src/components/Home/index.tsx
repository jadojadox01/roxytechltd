import BestSeller from "./BestSeller";
import CategoryGrid from "./Categories/CategoryGrid";
import CountDown from "./Countdown";
import FooterFeature from "./Hero/FooterFeature";
import Hero from "./Hero";
import NewArrival from "./NewArrivals";
import PromoBand from "./PromoBand";

const Home = () => {
  return (
    <main className="flex flex-col gap-14 pb-16 md:gap-20">
      <Hero />
      <PromoBand />
      <CategoryGrid />
      <BestSeller />
      <NewArrival />
      <CountDown />
      <FooterFeature />
    </main>
  );
};

export default Home;
