"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function LandingMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!root.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const scope = root.current;
    const media = gsap.matchMedia();
    let disposed = false;

    media.add("(prefers-reduced-motion: no-preference)", () => {
      const intro = scope.querySelectorAll("[data-hero-copy] > *");
      gsap.from(intro, {
        y: 24, opacity: 0, duration: 0.85, stagger: 0.1,
        ease: "power3.out", clearProps: "transform,opacity",
      });
      scope.querySelectorAll("section:not(#top) h2").forEach((heading) => {
        gsap.from(heading, {
          y: 22, opacity: 0, duration: 0.8, ease: "power3.out",
          clearProps: "transform,opacity",
          scrollTrigger: { trigger: heading, start: "top 92%", once: true },
        });
      });
      scope.querySelectorAll("[data-preview-reveal]").forEach((preview) => {
        gsap.from(preview, {
          scale: 0.96, opacity: 0, duration: 0.9, ease: "power3.out",
          clearProps: "transform,opacity",
          scrollTrigger: { trigger: preview, start: "top 92%", once: true },
        });
      });
    }, scope);

    media.add("(min-width: 960px) and (prefers-reduced-motion: no-preference)", () => {
      const hero = scope.querySelector("#top");
      gsap.to(scope.querySelector("[data-hero-depth]"), {
        y: 110, rotation: 4, ease: "none",
        scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 0.8 },
      });
      scope.querySelectorAll<HTMLElement>("[data-parallax]").forEach((panel) => {
        gsap.fromTo(panel, { y: 28 }, {
          y: -28, ease: "none",
          scrollTrigger: {
            trigger: panel.closest("section"), start: "top bottom",
            end: "bottom top", scrub: 0.7,
          },
        });
      });
    }, scope);

    document.fonts.ready.then(() => { if (!disposed) ScrollTrigger.refresh(); });
    return () => { disposed = true; media.revert(); };
  }, []);

  return <main ref={root} id="main-content" className="w-full space-y-3 p-2.5">{children}</main>;
}
