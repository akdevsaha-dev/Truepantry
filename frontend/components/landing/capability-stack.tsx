"use client";

import { useEffect, useRef } from "react";

import { landingInner, landingSection } from "@/lib/landing-styles";

import styles from "./capability-stack.module.css";

const capabilities = [
  {
    id: "identify",
    label: "Exact product match",
    title: "Scan the item, not the category",
    description:
      "Carted matches the barcode to the exact flavour and pack size, then reads the serving, ingredient, allergen, and nutrition details that belong to it.",
    theme: "sage",
    icon: (
      <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M16.4596 11.6681H17.293C17.5231 11.6681 17.7096 11.4815 17.7096 11.2514V8.75139C17.7096 8.52127 17.5231 8.33472 17.293 8.33472H16.4596M3.54297 8.33472H2.70964C2.47952 8.33472 2.29297 8.52127 2.29297 8.75139V11.2514C2.29297 11.4815 2.47952 11.6681 2.70964 11.6681H3.54297M10.0013 2.29297V4.3763M7.5013 11.9135H12.5013M4.79297 4.3763H15.2096C15.9 4.3763 16.4596 4.93595 16.4596 5.6263V14.3763C16.4596 15.0667 15.9 15.6263 15.2096 15.6263H4.79297C4.10261 15.6263 3.54297 15.0667 3.54297 14.3763V5.6263C3.54297 4.93595 4.10261 4.3763 4.79297 4.3763Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M7.70703 8.23047L7.70703 8.2388M12.2904 8.23047V8.2388" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "compare",
    label: "Useful comparison",
    title: "Compare what changes the decision",
    description:
      "See price per 100 g, added sugar, protein per serving, or allergen differences side by side—without switching between calculator and label.",
    theme: "lilac",
    icon: (
      <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M15.165 4.08203C15.5793 4.08203 15.915 4.41782 15.915 4.83203V15.165C15.915 15.5793 15.5793 15.915 15.165 15.915H4.83203C4.41782 15.915 4.08203 15.5793 4.08203 15.165V4.83203C4.08203 4.41782 4.41782 4.08203 4.83203 4.08203H15.165ZM15.165 17.415C16.4077 17.415 17.415 16.4077 17.415 15.165V4.83203C17.415 3.58939 16.4077 2.58203 15.165 2.58203H4.83203C3.58939 2.58203 2.58203 3.58939 2.58203 4.83203V15.165C2.58203 16.4077 3.58939 17.415 4.83203 17.415H15.165ZM14.1651 7.34394C14.5793 7.34394 14.9151 7.67973 14.9151 8.09394C14.9151 8.50816 14.5793 8.84394 14.1651 8.84394L5.83207 8.84394C5.41786 8.84394 5.08207 8.50816 5.08207 8.09394C5.08207 7.67973 5.41786 7.34394 5.83207 7.34394L14.1651 7.34394ZM14.1651 11.1535C14.5793 11.1535 14.9151 11.4893 14.9151 11.9035C14.9151 12.3177 14.5793 12.6535 14.1651 12.6535L5.83207 12.6535C5.41786 12.6535 5.08207 12.3177 5.08207 11.9035C5.08207 11.4893 5.41786 11.1535 5.83207 11.1535L14.1651 11.1535Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    id: "remember",
    label: "Whole-cart context",
    title: "Make the next choice with the basket in mind",
    description:
      "Carted remembers the goal for this trip and what is already in your basket, so the fourth snack is judged differently from the first.",
    theme: "blush",
    icon: (
      <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12.4158 15.9573C12.4158 15.9573 12.5018 11.0041 7.29193 11.0041C2.08208 11.0041 2.16806 15.9573 2.16806 15.9573M11.7564 4.25428C12.0614 4.11846 12.3991 4.04297 12.7545 4.04297C14.1108 4.04297 15.2103 5.14246 15.2103 6.49876C15.2103 7.85505 14.1108 8.95454 12.7545 8.95454C12.3991 8.95454 12.0614 8.87905 11.7564 8.74323M7.29193 8.95454C5.93563 8.95454 4.83614 7.85505 4.83614 6.49876C4.83614 5.14246 5.93563 4.04297 7.29193 4.04297C8.64823 4.04297 9.74772 5.14246 9.74772 6.49876C9.74772 7.85505 8.64823 8.95454 7.29193 8.95454ZM15.1278 15.9573C15.1278 15.9573 15.1843 12.7099 11.7766 12.2783"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
] as const;

function CheckMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none">
      <path d="m3.5 8.2 2.8 2.7 6.2-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PanelHeader({ label, meta }: { label: string; meta: string }) {
  return (
    <div className={styles.panelHeader}>
      <span className={styles.panelStatus}><i aria-hidden="true" />{label}</span>
      <span className={styles.panelMeta}>{meta}</span>
    </div>
  );
}

function IdentifyVisual() {
  return (
    <div className={`${styles.visualPanel} ${styles.identifyVisual}`} role="img" aria-label="Exact product match example">
      <PanelHeader label="Exact match" meta="Scan 1.8 s" />
      <div className={styles.productIdentity}>
        <div className={styles.productPack} aria-hidden="true">
          <span>18 g</span>
          <small>protein</small>
        </div>
        <div className={styles.productName}>
          <span>Dairy / Original</span>
          <strong>Plain Greek yogurt</strong>
          <p>750 g tub</p>
        </div>
        <div className={styles.matchScore}>
          <strong>99.8%</strong>
          <span>confidence</span>
        </div>
      </div>
      <div className={styles.barcodeRow}>
        <span className={styles.barcode} aria-hidden="true" />
        <span>9 310076 002184</span>
      </div>
      <div className={styles.verificationGrid}>
        <span><CheckMark />Barcode</span>
        <span><CheckMark />Variant</span>
        <span><CheckMark />Label data</span>
      </div>
    </div>
  );
}

const comparisonRows = [
  { label: "Unit price", selected: "$0.84", typical: "$1.10", suffix: "/ 100 g" },
  { label: "Added sugar", selected: "0 g", typical: "7.4 g", suffix: "/ serve" },
  { label: "Protein", selected: "18 g", typical: "12 g", suffix: "/ serve" },
] as const;

function CompareVisual() {
  return (
    <div className={`${styles.visualPanel} ${styles.compareVisual}`} role="img" aria-label="Product comparison example">
      <PanelHeader label="Shelf comparison" meta="3 useful differences" />
      <div className={styles.comparisonColumns} aria-hidden="true">
        <span>Measure</span>
        <strong>This item</strong>
        <span>Typical option</span>
      </div>
      <div className={styles.comparisonTable}>
        {comparisonRows.map((row) => (
          <div className={styles.comparisonRow} key={row.label}>
            <span>{row.label}<small>{row.suffix}</small></span>
            <strong>{row.selected}</strong>
            <span>{row.typical}</span>
          </div>
        ))}
      </div>
      <div className={styles.comparisonVerdict}>
        <span><CheckMark /></span>
        <div><strong>Stronger fit for high protein</strong><small>Lower unit price than the compared option</small></div>
      </div>
    </div>
  );
}

function BasketVisual() {
  return (
    <div className={`${styles.visualPanel} ${styles.basketVisual}`} role="img" aria-label="Whole basket recommendation example">
      <PanelHeader label="Basket context" meta="5 items scanned" />
      <div className={styles.goalStrip}>
        <div><span>Today&apos;s goal</span><strong>Less added sugar</strong></div>
        <span className={styles.onTrack}><CheckMark />On track</span>
      </div>
      <div className={styles.basketSnapshot}>
        <div className={styles.snapshotLabel}>
          <span>Basket so far</span>
          <strong>20 g added sugar</strong>
        </div>
        <div className={styles.basketRail} aria-hidden="true">
          <span className={styles.filledNode}>8</span>
          <span className={styles.filledNode}>12</span>
          <span>0</span>
          <span>0</span>
          <span className={styles.currentNode}><CheckMark /></span>
        </div>
        <div className={styles.railLabels} aria-hidden="true">
          <span>Earlier items</span>
          <span>This yogurt</span>
        </div>
      </div>
      <div className={styles.basketVerdict}>
        <span className={styles.verdictIcon}><CheckMark /></span>
        <div><span>Carted says</span><strong>Add it</strong><p>Adds 18 g protein without adding sugar.</p></div>
        <span className={styles.fitBadge}>Good fit</span>
      </div>
    </div>
  );
}

function CapabilityVisual({ id }: { id: string }) {
  if (id === "identify") return <IdentifyVisual />;
  if (id === "compare") return <CompareVisual />;
  return <BasketVisual />;
}

export function CapabilityStack() {
  const cardRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const cards = cardRefs.current.filter(
      (card): card is HTMLElement => Boolean(card),
    );

    if (
      cards.length < 3 ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    let frameId: number | null = null;

    const updateCardScales = () => {
      const secondCardRect = cards[1].getBoundingClientRect();
      const thirdCardRect = cards[2].getBoundingClientRect();
      const firstProgress = Math.min(
        1,
        Math.max(0, (450 - secondCardRect.top) / (450 - 112)),
      );
      const secondProgress = Math.min(
        1,
        Math.max(0, (450 - thirdCardRect.top) / (450 - 128)),
      );

      cards[0].style.transform = `scale(${1 - firstProgress * 0.1})`;
      cards[1].style.transform = `scale(${1 - secondProgress * 0.1})`;
      frameId = null;
    };

    const requestCardUpdate = () => {
      if (frameId === null) {
        frameId = window.requestAnimationFrame(updateCardScales);
      }
    };

    window.addEventListener("scroll", requestCardUpdate, { passive: true });
    window.addEventListener("resize", requestCardUpdate);
    requestCardUpdate();

    return () => {
      window.removeEventListener("scroll", requestCardUpdate);
      window.removeEventListener("resize", requestCardUpdate);
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      cards.forEach((card) => card.style.removeProperty("transform"));
    };
  }, []);

  return (
    <section className={landingSection} id="capabilities" aria-labelledby="capabilities-heading">
      <div className={landingInner}>
        <div className="mx-auto mb-[clamp(2.5rem,5vw,4.5rem)] max-w-6xl text-center">
          <p className="mb-4 inline-flex items-center justify-center gap-2 font-mono text-xs font-medium tracking-[0.05em] text-ink uppercase">
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M11.6654 16.6654V3.33203L4.22285 5.56479C3.69412 5.72341 3.33203 6.21006 3.33203 6.76207V16.6654H11.6654ZM11.6654 16.6654H16.6654V9.58203C16.6654 8.89168 16.1057 8.33203 15.4154 8.33203H11.6654V16.6654ZM6.66536 8.12222H8.33203M6.66536 10.9347H8.33203M6.66536 13.7472H8.33203"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            What Carted does
          </p>
          <h2
            id="capabilities-heading"
            className="text-balance text-[clamp(1.85rem,3.8vw,3.25rem)] leading-[1.25] font-medium tracking-[-0.04em] text-ink-soft"
          >
            The label gives you facts. Carted tells you which ones matter for this shop.
          </h2>
        </div>

        <div className={styles.stack}>
          {capabilities.map((capability, index) => (
            <article
              className={`${styles.card} ${styles[capability.theme]}`}
              key={capability.id}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
            >
              <div className={styles.cardCopy}>
                <p className={styles.cardLabel}>
                  {capability.icon}
                  {capability.label}
                </p>
                <h3 className={styles.cardTitle}>{capability.title}</h3>
                <p className={styles.cardDescription}>{capability.description}</p>
              </div>

              <div data-preview-reveal className="min-w-0">
                <CapabilityVisual id={capability.id} />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
