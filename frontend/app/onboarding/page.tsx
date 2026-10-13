import type { Metadata } from "next";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";

export const metadata: Metadata = {
  title: "A cart that gets you — Carted",
  description: "Make Carted yours. Tell us a little about yourself, your goals, and the food you love.",
};

export default function OnboardingPage() {
  return <OnboardingFlow />;
}
