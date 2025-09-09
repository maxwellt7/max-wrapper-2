import Section from "@/components/Section";
import Navbar from "@/components/(ui-components)/navbars/Navbar-1";
import Hero from "@/components/(ui-components)/heros/HeroVision";
import How from "@/components/(ui-components)/how/How-1";
import Features from "@/components/(ui-components)/features/Features-2";

import Pricing from "@/components/(ui-components)/pricing/Pricing-1";
import CTA from "@/components/(ui-components)/ctas/CTA-1";

import FAQ from "@/components/(ui-components)/faqs/FAQ-1";
import Footer from "@/components/(ui-components)/footers/Footer-1";
import Testimonials from "@/components/(ui-components)/testimonials/Testimonials-1";

import { toolConfig } from "@/app/(apps)/vision/toolConfig";

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
        <Section>
          <How />
          <Features />
          <Testimonials />
        </Section>
        <Pricing />
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
