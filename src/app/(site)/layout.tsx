import Footer from "../../components/Footer";
import ScrollToTop from "@/components/Common/ScrollToTop";
import PreLoader from "@/components/Common/PreLoader";
import { Toaster } from "react-hot-toast";
import Providers from "./Providers";
import NextTopLoader from "nextjs-toploader";
import MainHeader from "@/components/Header/MainHeader";
import PromoTicker from "@/components/Header/PromoTicker";
import { getHeaderSettings } from "@/get-api-data/header-setting";
import { getSiteSettings } from "@/get-api-data/site-settings";
import { getCategories } from "@/get-api-data/category";
import { getSiteName } from "@/get-api-data/seo-setting";
import Breadcrumb from "@/components/Common/Breadcrumb";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [headerSettingData, siteSettings, categories, siteName] = await Promise.all([
    getHeaderSettings(),
    getSiteSettings(),
    getCategories(),
    getSiteName(),
  ]);

  const navCategories = (categories ?? []).map((category: { id: string; title: string; slug: string }) => ({
    id: category.id,
    title: category.title,
    slug: category.slug,
  }));

  return (
    <div>
      <PreLoader />
      <>
        <Providers currency={siteSettings?.currency || "RWF"}>
          <NextTopLoader
            color="#0071CE"
            crawlSpeed={300}
            showSpinner={false}
            shadow="none"
          />
          <PromoTicker />
          <MainHeader
            headerData={headerSettingData}
            siteName={siteName}
            siteSettings={siteSettings}
            categories={navCategories}
          />
          <Breadcrumb />
          <Toaster position="top-center" reverseOrder={false} />
          {children}
        </Providers>

        <ScrollToTop />
        <Footer />
      </>
    </div>
  );
}