"use client";

import { useState } from "react";

import { ButtonLink } from "@/components/ui/button-link";
import {
  landingInner,
  landingSection,
  sectionHeading,
  sectionKicker,
} from "@/lib/landing-styles";

const planFeatures = {
  free: [
    "10 product scans each month",
    "1 active shopping goal",
    "Ingredient and allergen flags",
    "Nutrition and unit-price view",
  ],
  pro: [
    "Unlimited product scans",
    "Unlimited goals and household profiles",
    "Side-by-side product comparisons",
    "Whole-basket recommendations",
    "Saved scan and purchase history",
  ],
} as const;

type BillingCycle = "monthly" | "annual";

const billingButtonStyles =
  "min-h-11 flex-1 cursor-pointer rounded-[0.55rem] border-0 bg-transparent px-3.5 py-2.5 font-semibold text-ink-soft transition-[background-color,color,box-shadow] sm:flex-none";

const activeBillingButtonStyles = "bg-surface text-ink shadow-[0_2px_8px_rgb(23_23_23/7%)]";

const planCardStyles =
  "flex flex-col rounded-xl p-[clamp(1.5rem,3vw,2.25rem)]";

export function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const isAnnual = billingCycle === "annual";

  return (
    <section
      className={landingSection}
      id="pricing"
      aria-labelledby="pricing-heading"
    >
      <div className={landingInner}>
        <div className="mb-[clamp(2.5rem,5vw,4rem)] flex flex-col items-stretch justify-between gap-8 min-[821px]:flex-row min-[821px]:items-end">
          <div>
            <p className={sectionKicker}>Simple pricing</p>
            <h2 id="pricing-heading" className={`${sectionHeading} max-w-3xl`}>
              Start with the labels. Upgrade for the whole basket.
            </h2>
          </div>
          <div
            className="flex w-full shrink-0 gap-1 rounded-xl border border-line bg-surface-soft p-1 sm:w-fit"
            role="group"
            aria-label="Billing cycle"
          >
            <button
              type="button"
              className={`${billingButtonStyles} ${
                !isAnnual ? activeBillingButtonStyles : ""
              }`}
              aria-pressed={!isAnnual}
              onClick={() => setBillingCycle("monthly")}
            >
              Monthly
            </button>
            <button
              type="button"
              className={`${billingButtonStyles} ${
                isAnnual ? activeBillingButtonStyles : ""
              }`}
              aria-pressed={isAnnual}
              onClick={() => setBillingCycle("annual")}
            >
              Annual <span className="block text-[0.65rem] font-medium">2 months free</span>
            </button>
          </div>
        </div>

        <div className="grid gap-4 min-[821px]:grid-cols-2">
          <article className={`${planCardStyles} border border-line bg-surface`}>
            <div className="flex flex-col items-start justify-between gap-1.5 sm:flex-row sm:items-baseline sm:gap-4">
              <h3 className="text-[1.35rem] font-semibold">Free</h3>
              <span className="text-sm text-ink-soft">For occasional checks</span>
            </div>
            <div className="mt-7 flex min-h-24 items-baseline gap-3 tabular-nums">
              <strong className="font-mono text-[clamp(2.5rem,5vw,4rem)] font-medium tracking-[-0.07em]">
                $0
              </strong>
              <span className="text-sm text-ink-soft">forever</span>
            </div>
            <p className="mb-6 min-[821px]:min-h-[4.8rem] leading-[1.55] text-ink-soft">
              Check unfamiliar products and keep one current shopping priority on
              hand.
            </p>
            <ButtonLink href="#product" tone="secondary">Choose Free</ButtonLink>
            <ul className="mt-8 grid list-none gap-3.5 border-t border-line pt-6">
              {planFeatures.free.map((feature) => (
                <li className="flex items-start gap-3 leading-[1.45]" key={feature}>
                  <span className="font-bold text-green-800" aria-hidden="true">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          </article>

          <article className={`${planCardStyles} border border-[#9acda7] bg-soft-green`}>
            <div className="flex flex-col items-start justify-between gap-1.5 sm:flex-row sm:items-baseline sm:gap-4">
              <h3 className="text-[1.35rem] font-semibold">Pro</h3>
              <span className="text-sm text-ink-soft">For every grocery run</span>
            </div>
            <div
              className="mt-7 flex min-h-24 items-baseline gap-3 tabular-nums"
              aria-live="polite"
              aria-atomic="true"
            >
              <strong className="font-mono text-[clamp(2.5rem,5vw,4rem)] font-medium tracking-[-0.07em]">
                {isAnnual ? "$129.90" : "$12.99"}
              </strong>
              <span className="text-sm text-ink-soft">
                {isAnnual ? "billed once a year" : "per month"}
              </span>
            </div>
            {isAnnual && (
              <p className="-mt-1 min-h-5 text-sm text-ink-soft">
                Equivalent to $10.83/month. Save $25.98 a year.
              </p>
            )}
            <p className="mb-6 min-[821px]:min-h-[4.8rem] leading-[1.55] text-ink-soft">
              Compare freely, add everyone in your household, and get advice that
              considers the full basket.
            </p>
            <ButtonLink href="#product">Choose Pro</ButtonLink>
            <ul className="mt-8 grid list-none gap-3.5 border-t border-line pt-6">
              {planFeatures.pro.map((feature) => (
                <li className="flex items-start gap-3 leading-[1.45]" key={feature}>
                  <span className="font-bold text-green-800" aria-hidden="true">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          </article>
        </div>

        <p className="mt-4 text-center text-sm leading-[1.5] text-ink-soft">
          Prices are in USD. Annual Pro is charged as one $129.90 payment. Cancel
          before renewal to avoid the next charge.
        </p>
      </div>
    </section>
  );
}
