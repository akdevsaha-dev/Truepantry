import Image from "next/image";
import { BrandLogo } from "@/components/ui/brand-logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main
      id="auth-layout"
      className="grid h-screen h-[100dvh] max-h-[100dvh] overflow-hidden grid-cols-1 gap-0 bg-white p-0 motion-reduce:[&_*]:!animate-none motion-reduce:[&_*]:!transition-none min-[801px]:grid-cols-2 min-[801px]:gap-3 min-[801px]:p-3 min-[1600px]:mx-auto min-[1600px]:max-w-[1800px]"
    >
      <section
        id="main-content"
        className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden px-9 pt-5 pb-3 max-[1050px]:px-5 max-[1050px]:pt-4 max-[1050px]:pb-3 max-[800px]:px-6 max-[800px]:pt-[max(16px,env(safe-area-inset-top))] max-[800px]:pb-[max(16px,env(safe-area-inset-bottom))] max-[380px]:px-5"
      >
        <header className="flex items-center">
          <BrandLogo />
        </header>

        <div className="grid flex-1 min-h-0 items-center px-4 py-2 max-[1050px]:px-1 max-[800px]:px-0">
          {children}
        </div>
      </section>

      <aside
        className="relative hidden min-[801px]:flex h-full min-h-0 flex-col overflow-hidden rounded-[20px] bg-[#e9efdf] px-10 pt-7 pb-4 text-[#263b2c] max-[1050px]:px-7"
        aria-label="Shopping with truePantry"
      >
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-xs max-[380px]:text-[11px]">
            <span className="inline-block size-1.5 rounded-full bg-[#54754b]" />
            Your everyday shopping companion
          </span>
          <span className="text-[35px] leading-none" aria-hidden="true">
            ✳
          </span>
        </div>

        <div className="relative z-[2] mt-[clamp(20px,3.5vh,44px)]">
          <h2 className="m-0 text-[clamp(32px,3.6vw,56px)] font-medium leading-[1] tracking-[-0.065em]">
            Good choices.
            <br />
            Great groceries.
          </h2>
          <p className="m-0 mt-3 text-sm leading-[1.6] text-[#57644f]">
            A second opinion on what goes in your cart.
            <br />
            A little more confidence in what comes home.
          </p>
        </div>

        <div className="relative -mx-10 min-h-0 flex-1 max-[1050px]:-mx-7 min-[1600px]:w-[calc(100%+80px)] min-[1600px]:self-center">
          <div
            className="absolute top-[18px] left-1/2 size-[460px] -translate-x-1/2 rounded-full border border-[#d5dec8] after:absolute after:inset-[35px] after:rounded-full after:border after:border-[#d5dec8] after:content-['']"
            aria-hidden="true"
          />
          <Image
            className="absolute -top-[6%] -right-[8%] h-auto w-[88%] -rotate-9 mix-blend-multiply animate-[cartEnter_1.3s_cubic-bezier(0.2,0.7,0.2,1)_both] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_71%)]"
            src="/images/truepantry-grocery-cart-transparent.png"
            alt="A grocery cart filled with avocado, fresh bread, blueberries, and oat milk"
            width={720}
            height={720}
            priority
            sizes="(max-width: 800px) 90vw, 48vw"
          />

          <div className="absolute bottom-[20px] left-[7%] w-[254px] -rotate-7 bg-[#fffefa] px-[23px] pt-4 pb-[14px] shadow-[0_15px_35px_#35422c18] animate-[receiptEnter_1s_0.25s_cubic-bezier(0.2,0.7,0.2,1)_both] after:absolute after:-bottom-[9px] after:right-0 after:left-0 after:h-[10px] after:content-[''] after:[background:linear-gradient(135deg,#fffefa_25%,transparent_25%)_-5px_0/10px_10px,linear-gradient(225deg,#fffefa_25%,transparent_25%)_-5px_0/10px_10px] max-[1050px]:left-[5%] max-[1050px]:w-[238px]">
            <div className="flex justify-between text-base font-[650] tracking-[-0.04em]">
              <span>One smarter shop</span>
              <span aria-hidden="true">↗</span>
            </div>
            <p className="m-0 mt-1 mb-[14px] text-[11px] text-[#737568]">
              A little help, aisle by aisle.
            </p>
            <ul className="m-0 grid list-none gap-[10px] border-y border-dashed border-[#cfd3c4] p-0 py-[12px]">
              <li className="flex items-center gap-2 text-[11px] animate-[enter_0.5s_0.65s_both]">
                <span className="grid size-[17px] place-items-center rounded-full bg-[#eaf0df] text-[10px] text-[#42693b]">
                  ✓
                </span>
                Understand the ingredients
              </li>
              <li className="flex items-center gap-2 text-[11px] animate-[enter_0.5s_0.85s_both]">
                <span className="grid size-[17px] place-items-center rounded-full bg-[#eaf0df] text-[10px] text-[#42693b]">
                  ✓
                </span>
                Find what fits your household
              </li>
              <li className="flex items-center gap-2 text-[11px] animate-[enter_0.5s_1.05s_both]">
                <span className="grid size-[17px] place-items-center rounded-full bg-[#eaf0df] text-[10px] text-[#42693b]">
                  ✓
                </span>
                Compare the real value
              </li>
            </ul>
            <div className="flex justify-between py-[12px] text-[11px]">
              <span>Less guesswork.</span>
              <strong>More good.</strong>
            </div>
            <div
              className="mx-auto h-[20px] w-[78px] opacity-55 [background:repeating-linear-gradient(90deg,#263b2c_0_1px,transparent_1px_3px,#263b2c_3px_5px,transparent_5px_7px,#263b2c_7px_8px,transparent_8px_12px)]"
              aria-hidden="true"
            />
          </div>

          <span className="absolute right-[9%] bottom-[16px] flex rotate-5 items-center gap-2 rounded-[30px] border border-[#dce5cb] bg-[#f7faef] px-3.5 py-2 text-xs animate-[enter_0.7s_0.9s_both] max-[1050px]:right-[5%] max-[1050px]:bottom-0">
            <span className="text-[#456e36]" aria-hidden="true">
              ✓
            </span>
            A fresh perspective.
          </span>
        </div>

        <div className="relative flex items-center justify-between gap-4 pt-3 text-[11px] text-[#57644f]">
          <span>From the first scan to the last aisle.</span>
          <span
            className="grid size-[25px] place-items-center rounded-full border border-[#9fad90] text-base"
            aria-hidden="true"
          >
            c
          </span>
        </div>
      </aside>
    </main>
  );
}
