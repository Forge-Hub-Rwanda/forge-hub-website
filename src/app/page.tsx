import { Hero } from "@/components/hero";
import { PartnerMarquee } from "@/components/partner-marquee";
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <PartnerMarquee />
      </main>
    </>
  );
}
