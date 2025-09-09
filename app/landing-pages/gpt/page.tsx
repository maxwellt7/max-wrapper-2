import Navbar from "@/components/(ui-components)/navbars/Navbar-1";
import Hero from "@/components/(ui-components)/heros/HeroGPT";
import Testimonials from "@/components/(ui-components)/testimonials/Testimonials-1";
import Pricing from "@/components/(ui-components)/pricing/Pricing-3";
import How from "@/components/(ui-components)/how/How-2";
import FAQ from "@/components/(ui-components)/faqs/FAQ-1";
import CTA from "@/components/(ui-components)/ctas/CTA-3";
import Footer from "@/components/(ui-components)/footers/Footer-1";
import { toolConfig } from "@/app/(apps)/gpt/toolConfig";

export const metadata = {
  title: toolConfig.metadata.title,
  description: toolConfig.metadata.description,
  openGraph: {
    images: [toolConfig.metadata.og_image],
  },
  alternates: {
    canonical: toolConfig.metadata.canonical,
  },
};

export default function Page() {
  return (
    <>
      <div data-theme={toolConfig.company.theme}>
        <Navbar
          companyConfig={toolConfig.company!}
          navbarConfig={toolConfig.navbarLanding!}
        />
        <Hero />
        <How />
        <Pricing />
        <Testimonials />
        <CTA />
        <FAQ />
        <Footer
          companyConfig={toolConfig.company!}
          footerConfig={toolConfig.footerLanding!}
        />
      </div>
    </>
  );
}
