"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

import styles from "./proof-strip.module.css";

const marqueeItems = [
  "Exact product match",
  "Ingredients and allergens",
  "Price per 100 g",
  "Your shopping goal",
  "Whole-cart context",
] as const;

export function ProofStrip() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    if (!sectionRef.current || !trackRef.current) return;

    const media = gsap.matchMedia();

    media.add("(prefers-reduced-motion: no-preference)", () => {
      tweenRef.current = gsap.to(trackRef.current, {
        xPercent: -50,
        duration: 24,
        ease: "none",
        repeat: -1,
      });

      return () => {
        tweenRef.current = null;
      };
    }, sectionRef.current);

    return () => media.revert();
  }, []);

  const pauseMovement = () => tweenRef.current?.pause();
  const resumeMovement = () => tweenRef.current?.play();

  return (
    <section
      className={`island-section ${styles.section}`}
      aria-label="How Carted makes recommendations"
      ref={sectionRef}
    >
      <div className={styles.inner}>
        <div className={styles.intro}>
          <p>Every answer checks</p>
          <strong>product, person, and basket</strong>
        </div>

        <div
          className={styles.marquee}
          onMouseEnter={pauseMovement}
          onMouseLeave={resumeMovement}
          onFocus={pauseMovement}
          onBlur={resumeMovement}
        >
          <div className={styles.track} ref={trackRef}>
            {[false, true].map((isDuplicate) => (
              <div
                className={`${styles.group} ${isDuplicate ? styles.duplicate : ""}`}
                aria-hidden={isDuplicate || undefined}
                key={isDuplicate ? "duplicate" : "primary"}
              >
                {marqueeItems.map((item) => (
                  <div className={styles.item} key={`${isDuplicate}-${item}`}>
                    <span aria-hidden="true">✓</span>
                    <strong>{item}</strong>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
