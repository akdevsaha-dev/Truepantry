import { CapabilityStack } from "@/components/landing/capability-stack";
import { FaqSection } from "@/components/landing/faq-section";
import { Hero } from "@/components/landing/hero";
import { LandingMotion } from "@/components/landing/landing-motion";
import { InputNetwork } from "@/components/landing/input-network";
import { ProductStory } from "@/components/landing/product-story";
import { ProofStrip } from "@/components/landing/proof-strip";
import { PricingSection } from "@/components/landing/pricing-section";
import { SetupSteps } from "@/components/landing/setup-steps";
import { ShoppingMoments } from "@/components/landing/shopping-moments";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export default function Home() {
  return (
    <div>
      <SiteHeader />
      <LandingMotion>
        <Hero />
        <ProofStrip />
        <ProductStory />
        <CapabilityStack />
        <SetupSteps />
        <InputNetwork />
        <ShoppingMoments />
        <PricingSection />
        <FaqSection />
      </LandingMotion>
      <div className="w-full px-2.5 pb-2.5">
        <SiteFooter />
      </div>
    </div>
  );
}
