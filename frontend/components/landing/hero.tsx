import Image from "next/image";

import { ButtonLink } from "@/components/ui/button-link";

import styles from "./hero.module.css";

export function Hero() {
  return (
    <section className={styles.hero} id="top" aria-labelledby="hero-heading">
      <div className={styles.inner}>
        <div className={styles.copy} data-hero-copy>
          <p className={styles.kicker}>Your second opinion in the grocery aisle</p>
          <h1 id="hero-heading">Know what you&apos;re bringing home.</h1>
          <p className={styles.lede}>
            Scan a barcode and Carted checks the exact product against your goals,
            dietary needs, budget, and everything else already in your basket.
          </p>
          <div className={styles.actions}>
            <ButtonLink href="#product">Try a sample scan</ButtonLink>
            <ButtonLink href="#setup" tone="secondary">
              See how it works
            </ButtonLink>
          </div>
        </div>

        <div className={styles.visual} data-hero-depth aria-hidden="true">
          <div className={styles.orbit} />
          <Image
            className={styles.image}
            src="/images/carted-grocery-cart-transparent.png"
            alt=""
            width={1000}
            height={1000}
            priority
          />
        </div>
      </div>
    </section>
  );
}
