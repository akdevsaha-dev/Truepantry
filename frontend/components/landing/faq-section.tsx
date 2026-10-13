"use client";

import { useState } from "react";

import {
  landingInner,
  landingSection,
  sectionHeading,
  sectionKicker,
} from "@/lib/landing-styles";

const faqs = [
  {
    question: "What happens when I scan a product?",
    answer:
      "Carted matches the barcode to the exact product, reads available label and price data, and checks it against the shopping goal and household rules you selected. The result includes the facts behind the recommendation.",
  },
  {
    question: "Does Carted decide whether a food is healthy?",
    answer:
      "No. Foods do not receive a universal good-or-bad score. Carted explains how a product fits a specific goal—such as lower added sugar, more protein, or a lower unit price—so you can make the final call.",
  },
  {
    question: "Can I add allergies and dietary preferences?",
    answer:
      "Yes. You can keep allergies, intolerances, and preferences in a household profile. Carted puts relevant ingredient and may-contain warnings ahead of nutrition or price suggestions.",
  },
  {
    question: "What if Carted cannot verify the exact item?",
    answer:
      "It will say that the match is incomplete and ask you to confirm the variant or scan the nutrition and ingredient panels. Carted does not substitute data from a similar flavour or pack size without telling you.",
  },
  {
    question: "How does annual Pro billing work?",
    answer:
      "Annual Pro costs $129.90 in one payment, which is equivalent to $10.83 per month and saves $25.98 compared with twelve monthly payments. You can cancel before renewal and keep Pro until the paid term ends.",
  },
];

export function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section className={landingSection} id="faq" aria-labelledby="faq-heading">
      <div
        className={`${landingInner} grid items-start gap-10 min-[1025px]:grid-cols-[4fr_7fr] min-[1025px]:gap-[clamp(2.5rem,5vw,4rem)]`}
      >
        <div className="min-[1025px]:sticky min-[1025px]:top-24">
          <div>
            <p className={`${sectionKicker} inline-flex items-center gap-2`}>
              <svg
                aria-hidden="true"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8.47624 8.69997C8.47624 7.85773 9.159 7.17497 10.0012 7.17497C10.8435 7.17497 11.5262 7.85773 11.5262 8.69997C11.5262 9.21722 11.2687 9.67432 10.8749 9.95007C10.454 10.2447 10.0012 10.6415 10.0012 11.1552M10.0012 12.8286H10.0074M17.7096 10.0013C17.7096 14.2585 14.2585 17.7096 10.0013 17.7096C5.74411 17.7096 2.29297 14.2585 2.29297 10.0013C2.29297 5.74411 5.74411 2.29297 10.0013 2.29297C14.2585 2.29297 17.7096 5.74411 17.7096 10.0013Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              FAQ
            </p>
            <h2 id="faq-heading" className={sectionHeading}>
              Questions worth answering before your first scan
            </h2>
          </div>
        </div>

        <div className="w-full">
          <div className="flex flex-col">
            {faqs.map((faq, idx) => {
              const isOpen = openIdx === idx;
              const questionId = `faq-question-${idx}`;
              const answerId = `faq-answer-${idx}`;

              return (
                <div className="border-b border-neutral-100" key={faq.question}>
                  <button
                    id={questionId}
                    type="button"
                    className="flex min-h-11 w-full cursor-pointer items-center gap-4 bg-transparent py-5 text-left"
                    onClick={() => setOpenIdx(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                    aria-controls={answerId}
                  >
                    <span
                      className={`flex size-7 shrink-0 items-center justify-center rounded-lg text-ink-soft transition-[transform,background-color,color] duration-200 ${
                        isOpen ? "rotate-90 bg-ink text-surface" : "bg-transparent"
                      }`}
                      aria-hidden="true"
                    >
                      <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M6.30078 13.6523L11.5508 8.40234L6.30078 3.15234"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <span className="text-xl font-medium text-ink">{faq.question}</span>
                  </button>
                  {isOpen && (
                    <div
                      className="pb-5 pl-11"
                      id={answerId}
                      role="region"
                      aria-labelledby={questionId}
                    >
                      <p className="max-w-xl text-base leading-[1.625] text-ink-soft">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
