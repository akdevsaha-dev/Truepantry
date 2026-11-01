import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { isTokenValid } from "@/lib/auth/token";

export const metadata: Metadata = { title: "Sign in · truePantry" };

export default async function SignInPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (token && isTokenValid(token)) {
    redirect("/dashboard");
  }

  return <AuthForm key="sign-in" mode="sign-in" />;
}

