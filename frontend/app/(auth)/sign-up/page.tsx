import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
export const metadata: Metadata = { title: "Create your account · Carted" };
export default function SignUpPage() { return <AuthForm key="sign-up" mode="sign-up" />; }
