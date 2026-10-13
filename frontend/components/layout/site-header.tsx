"use client";

import { useEffect, useRef, useState } from "react";
import { ButtonLink } from "@/components/ui/button-link";
import styles from "./site-header.module.css";

import { BrandLogo } from "@/components/ui/brand-logo";

const links = [
  ["Product", "#product"],
  ["Features", "#capabilities"],
  ["How it works", "#setup"],
  ["Pricing", "#pricing"],
  ["FAQ", "#faq"],
] as const;

function Brand() {
  return <BrandLogo href="#top" />;
}

export function SiteHeader() {
  const headerRef = useRef<HTMLElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const update = () => headerRef.current?.toggleAttribute("data-scrolled", window.scrollY > 48);
    const desktop = window.matchMedia("(min-width: 960px)");
    const closeOnDesktop = () => { if (desktop.matches) dialogRef.current?.close(); };
    update();
    window.addEventListener("scroll", update, { passive: true });
    desktop.addEventListener("change", closeOnDesktop);
    return () => {
      window.removeEventListener("scroll", update);
      desktop.removeEventListener("change", closeOnDesktop);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [open]);

  return (
    <header className={styles.header} ref={headerRef}>
      <div className={styles.inner}>
        <Brand />
        <div className={styles.desktopMenu}>
          <nav className={styles.nav} aria-label="Primary navigation">
            {links.map(([label, href]) => <a key={href} href={href}>{label}</a>)}
          </nav>
          <ButtonLink href="/sign-up">Start free</ButtonLink>
        </div>
        <button className={styles.menuButton} aria-expanded={open} aria-controls="mobile-navigation"
          aria-label="Open navigation" onClick={() => { dialogRef.current?.showModal(); setOpen(true); }}>
          <span>Menu</span><span className={styles.menuIcon} aria-hidden="true"><i /><i /></span>
        </button>
      </div>
      <dialog ref={dialogRef} id="mobile-navigation" className={styles.sheet}
        aria-label="Navigation" onClose={() => setOpen(false)}
        onClick={(event) => { if (event.target === event.currentTarget) dialogRef.current?.close(); }}>
        <div className={styles.sheetTop}>
          <div onClick={() => dialogRef.current?.close()}><Brand /></div>
          <button className={styles.closeButton} aria-label="Close navigation" onClick={() => dialogRef.current?.close()}>
            <span className={styles.menuIcon} aria-hidden="true"><i /><i /></span>
          </button>
        </div>
        <nav className={styles.mobileNav} aria-label="Mobile navigation">
          {links.map(([label, href]) => <a key={href} href={href} onClick={() => dialogRef.current?.close()}>
            {label}<span aria-hidden="true">↗</span>
          </a>)}
        </nav>
        <div className={styles.sheetFooter}>
          <p>A second opinion.<br />For your next grocery shop.</p>
          <ButtonLink href="/sign-up" onClick={() => dialogRef.current?.close()}>Start free</ButtonLink>
        </div>
      </dialog>
    </header>
  );
}
