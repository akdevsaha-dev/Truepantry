"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import {
  landingInner,
  landingSection,
  sectionHeading,
  sectionKicker,
  sectionLede,
} from "@/lib/landing-styles";

import styles from "./setup-steps.module.css";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    num: "01",
    icon: "/images/steps/step-1.svg",
    title: "Set the rules once",
    description: "Add allergies, dietary needs, and household preferences. Pick a goal for the trip, such as more protein or a tighter budget.",
  },
  {
    num: "02",
    icon: "/images/steps/step-2.svg",
    title: "Scan the exact product",
    description: "Point your camera at the barcode. Carted matches the variant and reads the product facts tied to that code.",
  },
  {
    num: "03",
    icon: "/images/steps/step-3.svg",
    title: "Decide with context",
    description: "Get a short answer, the facts behind it, and a better comparison when another size or product is worth checking.",
  },
] as const;

export function SetupSteps() {
  const sectionRef = useRef<HTMLElement>(null);
  const stepperRef = useRef<HTMLDivElement>(null);
  const lineFillRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    const stepper = stepperRef.current;
    const lineFills = lineFillRefs.current.filter(
      (lineFill): lineFill is HTMLSpanElement => Boolean(lineFill),
    );

    if (!section || !stepper || lineFills.length === 0) return;

    const context = gsap.context(() => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (reduceMotion) {
        gsap.set(lineFills, { scaleY: 1 });
        return;
      }

      gsap.fromTo(
        lineFills,
        { scaleY: 0 },
        {
          scaleY: 1,
          duration: 1,
          stagger: 1,
          ease: "none",
          scrollTrigger: {
            trigger: stepper,
            start: "top 72%",
            end: "bottom 42%",
            scrub: 0.35,
          },
        },
      );
    }, section);

    return () => context.revert();
  }, []);

  return (
    <section
      className={landingSection}
      id="setup"
      aria-labelledby="setup-heading"
      ref={sectionRef}
    >
      <div
        className={`${landingInner} grid items-center gap-[clamp(2.5rem,5vw,6rem)] min-[1025px]:grid-cols-2`}
      >
        <div className="flex flex-col justify-between">
          <div>
            <p className={`${sectionKicker} inline-flex items-center gap-2`}>
              <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M4.9019 15.1007L2.66562 17.337M6.64006 16.8388L5.77104 17.7078M3.16199 13.3624L2.29297 14.2314M13.4208 6.58181L11.653 8.34958M9.88112 16.5444L3.45785 10.1211C2.73444 9.3977 3.13895 8.15905 4.14988 8.00203L7.12389 7.54009C7.38599 7.49938 7.62835 7.37635 7.81591 7.18879L10.6893 4.31537C10.8747 4.13004 11.1136 4.00765 11.3722 3.96551L15.2305 3.33702C16.0732 3.19974 16.8025 3.929 16.6652 4.77173L16.0367 8.62998C15.9946 8.88866 15.8722 9.12756 15.6869 9.31289L12.8134 12.1863C12.6259 12.3739 12.5028 12.6162 12.4621 12.8783L12.0002 15.8523C11.8432 16.8633 10.6045 17.2678 9.88112 16.5444Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              How it works
            </p>
            <h2 id="setup-heading" className={`${sectionHeading} mb-4`}>
              From barcode to a useful answer in three steps
            </h2>
            <p className={`${sectionLede} mb-10 max-w-lg`}>
              No nutrition spreadsheet and no one-size-fits-all score. Carted keeps the explanation short enough to use while you are standing in the aisle.
            </p>
            <Link
              href="#product"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-ink px-5 py-3 font-mono text-sm font-medium !text-white uppercase transition-[opacity,transform] duration-200 hover:-translate-y-px hover:opacity-85"
            >
              Try a sample scan
              <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M15.3581 4.46332C15.2893 4.41722 15.2113 4.38389 15.1273 4.36675L15.1156 4.36557C15.0812 4.3593 15.0464 4.35582 15.0115 4.35512L14.9968 4.35364L7.50083 4.35156C7.14186 4.35144 6.85049 4.64175 6.85021 5.00053C6.85008 5.35922 7.14069 5.6504 7.49945 5.65087L13.4311 5.65267L4.54155 14.5422C4.28781 14.7961 4.28843 15.2075 4.54224 15.4613C4.79605 15.7151 5.20749 15.7158 5.46134 15.462L14.3465 6.57691L14.3482 12.4967C14.3484 12.8556 14.6405 13.1465 14.9996 13.1464C15.3584 13.146 15.6489 12.8548 15.6488 12.4961L15.6467 5.0544C15.6605 4.87194 15.5976 4.68478 15.4582 4.54536C15.427 4.51418 15.3935 4.48684 15.3581 4.46332Z"
                  fill="currentColor"
                />
              </svg>
            </Link>
          </div>
        </div>

        <div className={styles.stepperWrap} ref={stepperRef}>
          {steps.map((step, idx) => (
            <div className={styles.stepRow} key={step.num}>
              {/* Timeline Indicator */}
              <div className={styles.indicatorCol}>
                <div className={`${styles.lineTop} ${idx === 0 ? styles.lineHidden : ""}`}>
                  {idx > 0 && (
                    <span
                      className={styles.lineFill}
                      ref={(element) => {
                        lineFillRefs.current[idx === 1 ? 1 : 3] = element;
                      }}
                    />
                  )}
                </div>
                <div className={styles.badge}>
                  <span>{step.num}</span>
                </div>
                <div className={`${styles.lineBottom} ${idx === steps.length - 1 ? styles.lineHidden : ""}`}>
                  {idx < steps.length - 1 && (
                    <span
                      className={styles.lineFill}
                      ref={(element) => {
                        lineFillRefs.current[idx === 0 ? 0 : 2] = element;
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Step Card */}
              <div className={styles.cardWrap}>
                <div className={styles.stepCard}>
                  <div className={styles.iconWrap}>
                    <Image src={step.icon} alt="" width={46} height={46} className={styles.stepIcon} />
                  </div>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepDescription}>{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
