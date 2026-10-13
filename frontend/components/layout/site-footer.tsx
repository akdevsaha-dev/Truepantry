import { FinalCta } from "@/components/landing/final-cta";
import { BrandLogo } from "@/components/ui/brand-logo";

export function SiteFooter() {
  return (
    <footer className="mt-3 w-full rounded-[22px] bg-black p-3 text-white">
      <FinalCta />
      <div className="mx-auto max-w-page px-6 pt-16 pb-6">
        <div className="grid gap-12 pb-16 min-[1025px]:grid-cols-[4fr_8fr] min-[1025px]:gap-10">
          <div className="flex flex-col">
            <div className="mb-7 self-start">
              <BrandLogo href="#top" theme="light" />
            </div>
            <p className="mb-10 max-w-sm text-base leading-[1.625] text-neutral-400">
              Carted turns product labels, shelf prices, and your own priorities
              into a clear grocery decision.
            </p>
          </div>

          <div className="min-[1025px]:border-l min-[1025px]:border-white/10 min-[1025px]:pl-[clamp(2rem,5vw,6rem)]">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3 className="mb-5 text-xl font-medium tracking-[-0.02em] text-white">
                  Explore
                </h3>
                <ul className="flex list-none flex-col text-base text-neutral-400">
                  <li><a className="inline-flex min-h-11 items-center transition-colors hover:text-white" href="#top">Home</a></li>
                  <li><a className="inline-flex min-h-11 items-center transition-colors hover:text-white" href="#product">Sample scan</a></li>
                  <li><a className="inline-flex min-h-11 items-center transition-colors hover:text-white" href="#capabilities">Features</a></li>
                  <li><a className="inline-flex min-h-11 items-center transition-colors hover:text-white" href="#pricing">Pricing</a></li>
                  <li><a className="inline-flex min-h-11 items-center transition-colors hover:text-white" href="#setup">How it works</a></li>
                  <li><a className="inline-flex min-h-11 items-center transition-colors hover:text-white" href="#faq">FAQ</a></li>
                </ul>
              </div>

              <div>
                <h3 className="mb-5 text-xl font-medium tracking-[-0.02em] text-white">
                  Plans
                </h3>
                <ul className="flex list-none flex-col text-base text-neutral-400">
                  <li><a className="inline-flex min-h-11 items-center transition-colors hover:text-white" href="#pricing">Free</a></li>
                  <li><a className="inline-flex min-h-11 items-center transition-colors hover:text-white" href="#pricing">Pro monthly</a></li>
                  <li><a className="inline-flex min-h-11 items-center transition-colors hover:text-white" href="#pricing">Pro annual</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start gap-3 border-t border-white/10 pt-8 text-sm text-neutral-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Carted. All rights reserved.</p>
          <p>Shopping guidance, not medical advice.</p>
        </div>
      </div>
    </footer>
  );
}
