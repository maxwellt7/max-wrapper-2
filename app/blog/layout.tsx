import { companyConfig } from "@/config";

import Navbar from "@/components/(ui-components)/navbars/Navbar-1";
import FAQ from "@/components/(ui-components)/faqs/FAQ-1";
import Footer from "@/components/(ui-components)/footers/Footer-1";
import Section from "@/components/Section";
import Features from "@/components/(ui-components)/features/Features-1";
import Pricing from "@/components/(ui-components)/pricing/Pricing-1";
import CTA from "@/components/(ui-components)/ctas/CTA-3";
import Testimonials from "@/components/(ui-components)/testimonials/Testimonials-1";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div data-theme={companyConfig.company.name}>
      <Navbar
        companyConfig={companyConfig.company!}
        navbarConfig={companyConfig.navbarLanding!}
      />
      <div className="min-h-screen">{children}</div>
      <Section>
        <Features />
        <Testimonials />
      </Section>
      <Pricing />
      <CTA />
      <FAQ />
      <Footer
        companyConfig={companyConfig.company!}
        footerConfig={companyConfig.footerLanding!}
      />
    </div>
  );
}
