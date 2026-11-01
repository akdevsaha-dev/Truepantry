import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { isTokenValid } from "@/lib/auth/token";

export const metadata: Metadata = { title: "Create your account · truePantry" };

export default async function SignUpPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (token && isTokenValid(token)) {
    redirect("/dashboard");
  }

  return <AuthForm key="sign-up" mode="sign-up" />;
}

