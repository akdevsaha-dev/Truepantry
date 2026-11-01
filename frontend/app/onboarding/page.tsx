import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { isTokenValid } from "@/lib/auth/token";

export const metadata: Metadata = {
  title: "A cart that gets you — truePantry",
  description: "Make truePantry yours. Tell us a little about yourself, your goals, and the food you love.",
};

export default async function OnboardingPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token || !isTokenValid(token)) {
    redirect("/sign-in?from=%2Fonboarding");
  }

  return <OnboardingFlow />;
}

