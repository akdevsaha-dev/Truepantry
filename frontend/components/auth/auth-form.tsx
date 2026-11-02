"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import { useAuthStore } from "@/lib/stores";

type Field = "email" | "username" | "password";
type Errors = Partial<Record<Field, string>>;

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const router = useRouter();
  const signup = mode === "sign-up";
  const { signIn, signUp, isLoading, checkAuth, clearError } = useAuthStore();
  const [isNavigating, setIsNavigating] = useState(false);
  const [visible, setVisible] = useState(false);
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [notice, setNotice] = useState("");
  const messageRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    checkAuth().then((currentUser) => {
      if (currentUser) {
        const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
        const returnUrl = params?.get("from") || params?.get("redirect");
        const safeReturn = returnUrl && returnUrl.startsWith("/") && !returnUrl.startsWith("//") ? returnUrl : null;
        router.replace(safeReturn || (currentUser.is_onboarded ? "/dashboard" : "/onboarding"));
      }
    });
  }, [checkAuth, router]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isLoading || isNavigating) return;

    const values = new FormData(event.currentTarget);
    const email = String(values.get("email") ?? "").trim();
    const username = String(values.get("username") ?? "").trim();
    const enteredPassword = String(values.get("password") ?? "");
    const next: Errors = {};

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = "Enter a valid email address.";
    }
    if (signup && (username.length < 3 || username.length > 18)) {
      next.username = "Use between 3 and 18 characters.";
    }
    if (enteredPassword.length < 8 || enteredPassword.length > 128) {
      next.password = "Use between 8 and 128 characters.";
    }

    setErrors(next);
    setNotice("");
    clearError();

    const firstError = Object.keys(next)[0];
    if (firstError) {
      (formRef.current?.elements.namedItem(firstError) as HTMLInputElement)?.focus();
      return;
    }

    try {
      if (signup) {
        await signUp({
          email,
          username,
          password: enteredPassword,
        });
        setIsNavigating(true);
        router.push("/onboarding");
        return;
      } else {
        const loggedInUser = await signIn({
          email,
          password: enteredPassword,
        });
        setIsNavigating(true);
        const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
        const returnUrl = params?.get("from") || params?.get("redirect");
        const safeReturn = returnUrl && returnUrl.startsWith("/") && !returnUrl.startsWith("//") ? returnUrl : null;
        if (safeReturn) {
          router.push(safeReturn);
        } else if (loggedInUser.is_onboarded) {
          router.push("/dashboard");
        } else {
          router.push("/onboarding");
        }
        return;
      }
    } catch (err: unknown) {
      setIsNavigating(false);
      const message =
        err instanceof Error
          ? err.message
          : "We couldn’t connect to truePantry. Please check your connection and try again.";
      setNotice(message);
    } finally {
      requestAnimationFrame(() => messageRef.current?.focus());
    }
  }

  return (
    <div className="mx-auto w-full max-w-[390px] animate-[enter_0.65s_cubic-bezier(0.2,0.7,0.2,1)_both] max-[800px]:max-w-[420px]">
      <span
        className="mb-4 grid size-11 place-items-center rounded-[14px] border border-[#dce5d9] bg-[#f0f5ed] text-[#254b36]"
        aria-hidden="true"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path
            d="m3 8 2 12h14l2-12H3Zm4 0 5-6 5 6M9 12v4m6-4v4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <h1 className="m-0 text-[clamp(26px,2.4vw,34px)] font-[550] leading-[1.15] tracking-[-0.055em] text-[#171717] max-[800px]:text-[30px] max-[380px]:text-[26px]">
        {signup ? "A fresh start." : "Good to have you back."}
      </h1>
      <nav className="mt-4 mb-4 flex rounded-xl bg-[#f3f4f1] p-1" aria-label="Account access">
        <Link
          href="/sign-in"
          aria-current={!signup ? "page" : undefined}
          className="grid min-h-[38px] flex-1 place-items-center rounded-[9px] text-sm font-[550] text-[#686c67] transition-[background,color] duration-200 hover:text-[#254b36] aria-[current=page]:bg-white aria-[current=page]:text-[#171717] aria-[current=page]:shadow-[0_2px_5px_#172c1510]"
        >
          Sign in
        </Link>
        <Link
          href="/sign-up"
          aria-current={signup ? "page" : undefined}
          className="grid min-h-[38px] flex-1 place-items-center rounded-[9px] text-sm font-[550] text-[#686c67] transition-[background,color] duration-200 hover:text-[#254b36] aria-[current=page]:bg-white aria-[current=page]:text-[#171717] aria-[current=page]:shadow-[0_2px_5px_#172c1510]"
        >
          Sign up
        </Link>
      </nav>
      <form
        ref={formRef}
        onSubmit={submit}
        noValidate
        className="grid gap-3.5"
        aria-busy={isLoading || isNavigating}
      >
        <div className="grid gap-1.5">
          <label htmlFor="email" className="text-[13px] font-semibold text-[#171717]">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            className="min-h-[46px] w-full rounded-[10px] border border-[#d5d8d1] bg-white px-[14px] py-[10px] font-inherit text-[15px] text-[#171717] transition-[border-color,box-shadow] duration-200 placeholder:text-[#858880] focus:border-[#66866b] focus:shadow-[0_0_0_3px_#eaf1e6] focus:outline-none aria-[invalid=true]:border-[#b24038]"
          />
          {errors.email && (
            <p id="email-error" className="m-0 text-xs leading-[1.5] text-[#a3322b]">
              {errors.email}
            </p>
          )}
        </div>

        {signup && (
          <div className="grid gap-1.5">
            <label htmlFor="username" className="text-[13px] font-semibold text-[#171717]">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="What should we call you?"
              minLength={3}
              maxLength={18}
              required
              aria-invalid={!!errors.username}
              aria-describedby={errors.username ? "username-error" : undefined}
              className="min-h-[46px] w-full rounded-[10px] border border-[#d5d8d1] bg-white px-[14px] py-[10px] font-inherit text-[15px] text-[#171717] transition-[border-color,box-shadow] duration-200 placeholder:text-[#858880] focus:border-[#66866b] focus:shadow-[0_0_0_3px_#eaf1e6] focus:outline-none aria-[invalid=true]:border-[#b24038]"
            />
            {errors.username && (
              <p id="username-error" className="m-0 text-xs leading-[1.5] text-[#a3322b]">
                {errors.username}
              </p>
            )}
          </div>
        )}

        <div className="grid gap-1.5">
          <label htmlFor="password" className="text-[13px] font-semibold text-[#171717]">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={visible ? "text" : "password"}
              autoComplete={signup ? "new-password" : "current-password"}
              placeholder={signup ? "Make it a good one (8+ chars)" : "Enter your password"}
              required
              minLength={8}
              maxLength={128}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
              className="min-h-[46px] w-full rounded-[10px] border border-[#d5d8d1] bg-white pr-[48px] pl-[14px] py-[10px] font-inherit text-[15px] text-[#171717] transition-[border-color,box-shadow] duration-200 placeholder:text-[#858880] focus:border-[#66866b] focus:shadow-[0_0_0_3px_#eaf1e6] focus:outline-none aria-[invalid=true]:border-[#b24038]"
            />
            <button
              className="absolute top-0.5 right-[3px] grid size-10 cursor-pointer place-items-center rounded-[7px] border-0 bg-transparent text-[#73776e] transition-colors hover:bg-[#f1f4ed] hover:text-[#254b36]"
              type="button"
              aria-label={visible ? "Hide password" : "Show password"}
              aria-pressed={visible}
              onClick={() => setVisible(!visible)}
            >
              {visible ? <EyeSlash size={19} /> : <Eye size={19} />}
            </button>
          </div>
          {errors.password ? (
            <p id="password-error" className="m-0 text-xs leading-[1.5] text-[#a3322b]">
              {errors.password}
            </p>
          ) : null}
        </div>

        {notice && (
          <div
            ref={messageRef}
            tabIndex={-1}
            className="rounded-lg bg-[#fff2ed] px-3.5 py-2.5 text-[13px] leading-[1.5] text-[#90362c]"
            role="alert"
          >
            {notice}
          </div>
        )}

        <button
          className="mt-1 flex min-h-[48px] w-full cursor-pointer items-center justify-center gap-3 rounded-[10px] border border-[#254b36] bg-[#254b36] text-sm font-[550] text-white transition-[background,transform,box-shadow] duration-200 hover:bg-[#183b29] hover:shadow-[0_4px_12px_#254b3625] active:scale-[0.99] disabled:cursor-wait disabled:opacity-70"
          disabled={isLoading || isNavigating}
          type="submit"
        >
          {isLoading || isNavigating ? (
            <>
              <span
                className="size-[17px] animate-spin rounded-full border-2 border-white/35 border-t-white"
                aria-hidden="true"
              />
              {signup ? (isNavigating ? "Redirecting to personalization…" : "Creating your account…") : "Signing you in…"}
            </>
          ) : (
            <>
              {signup ? "Create free account" : "Sign in"}
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                aria-hidden="true"
              >
                <path
                  d="M4 12h15m-6-6 6 6-6 6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </>
          )}
        </button>
      </form>

      {signup && (
        <p className="m-0 mt-3.5 text-center text-xs text-[#686c67]">
          Free to start. No credit card needed.
        </p>
      )}
    </div>
  );
}
