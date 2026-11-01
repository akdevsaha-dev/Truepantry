"use client";

import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/ui/brand-logo";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen min-h-[100dvh] flex-col bg-white px-6 py-6 sm:px-10">
      <header className="flex items-center">
        <BrandLogo />
      </header>

      <main
        id="main-content"
        className="my-auto grid flex-1 place-items-center py-12"
      >
        <div className="mx-auto w-full max-w-[390px] animate-[enter_0.65s_cubic-bezier(0.2,0.7,0.2,1)_both]">
          <span
            className="mb-4 grid size-11 place-items-center rounded-[14px] border border-[#dce5d9] bg-[#f0f5ed] font-mono text-xs font-bold text-[#254b36]"
            aria-hidden="true"
          >
            404
          </span>

          <h1 className="m-0 text-[clamp(26px,2.4vw,34px)] font-[550] leading-[1.15] tracking-[-0.055em] text-[#171717]">
            Page not found.
          </h1>

          <p className="my-2.5 mb-6 text-[14px] leading-[1.6] text-[#686c67]">
            The page you’re looking for doesn’t exist or may have been moved.
          </p>

          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined" && window.history.length > 1) {
                router.back();
              } else {
                router.push("/");
              }
            }}
            className="flex min-h-[46px] w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-[#254b36] bg-[#254b36] text-sm font-[550] text-white transition-[background,transform,box-shadow] duration-200 hover:bg-[#183b29] hover:shadow-[0_4px_12px_#254b3625] active:scale-[0.99]"
          >
            Go back
          </button>
        </div>
      </main>

      <footer className="text-center text-xs text-[#8c9189]">
        © {new Date().getFullYear()} truePantry.
      </footer>
    </div>
  );
}
