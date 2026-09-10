import type { Metadata } from "next";
import { Nav } from "@/components/landing/nav";
import { Hero } from "@/components/landing/hero";
import { Problem } from "@/components/landing/problem";
import { Approach } from "@/components/landing/approach";
import { Pipeline } from "@/components/landing/pipeline";
import { Alignment } from "@/components/landing/alignment";
import { Deliverables } from "@/components/landing/deliverables";
import { Architecture } from "@/components/landing/architecture";
import { Impact } from "@/components/landing/impact";
import { Closing, SiteFooter } from "@/components/landing/closing";
import { Metrics } from "@/components/landing/metrices";
import { Sensors } from "@/components/landing/sensors";

const TITLE = "LunaMatch — Chandrayaan-2 lunar image registration";
const DESCRIPTION =
  "Sun-angle, scale and viewpoint invariant image correspondence between Chandrayaan-2 optical imagery (OHRC, TMC-2, IIRS) and lunar reference frames. SIH problem statement 26166.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function Index() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-void text-bone">
      <div aria-hidden className="scanline pointer-events-none fixed inset-0 z-0 opacity-50" />
      <div
        aria-hidden
        className="pointer-events-none fixed -left-40 top-[-10%] z-0 size-[600px] rounded-full bg-signal/8 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed bottom-[-15%] right-[-10%] z-0 size-[500px] rounded-full bg-signal-deep/10 blur-[130px]"
      />

      <div className="relative z-10">
        <Nav />
        <main>
          <Hero />
          <Problem />
          <Sensors />
          <Approach />
          <Pipeline />
          <Alignment />
          <Metrics />
          <Deliverables />
          <Architecture />
          <Impact />
          <Closing />
        </main>
        <SiteFooter />
      </div>
    </div>
  );
}
