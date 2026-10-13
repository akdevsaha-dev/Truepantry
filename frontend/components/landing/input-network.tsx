import {
  landingInner,
  landingSection,
  sectionHeading,
  sectionKicker,
  sectionLede,
} from "@/lib/landing-styles";

import styles from "./input-network.module.css";

export function InputNetwork() {
  return (
    <section
      className={`${landingSection} max-sm:px-2.5`}
      id="inputs"
      aria-labelledby="inputs-heading"
    >
      <div className={landingInner}>
        <div className="mx-auto mb-[clamp(2.5rem,5vw,4rem)] max-w-3xl text-center">
          <p className={sectionKicker}>What informs the answer</p>
          <h2 id="inputs-heading" className={`${sectionHeading} mb-4`}>
            The whole label, not the loudest claim
          </h2>
          <p className={`${sectionLede} mx-auto max-w-2xl`}>
            Carted reads what is in the pack, what it costs, and whether it makes
            sense for your household and the rest of this shop.
          </p>
        </div>

        <div className={styles.scanBoard}>
          <div className={styles.boardHeader}>
            <span>Example input set</span>
            <strong>Plain Greek yogurt / 750 g</strong>
            <span className={styles.matched}>Label matched</span>
          </div>

          <div className={styles.boardGrid}>
            <article className={`${styles.panel} ${styles.nutritionPanel}`}>
              <div className={styles.panelHeader}>
                <span className={styles.index}>01</span>
                <span className={styles.source}>Nutrition panel</span>
              </div>
              <div className={styles.nutritionIntro}>
                <div>
                  <p className={styles.eyebrow}>Per 170 g serve</p>
                  <h3>What is actually in a bowl</h3>
                </div>
                <p>Carted also checks the per 100 g column so pack sizes compare fairly.</p>
              </div>
              <dl className={styles.nutritionStats}>
                <div><dt>Protein</dt><dd>18 g</dd></div>
                <div><dt>Added sugar</dt><dd>0 g</dd></div>
                <div><dt>Energy</dt><dd>386 kJ</dd></div>
              </dl>
            </article>

            <article className={`${styles.panel} ${styles.ingredientsPanel}`}>
              <div className={styles.panelHeader}>
                <span className={styles.index}>02</span>
                <span className={styles.source}>Ingredient list</span>
              </div>
              <h3>Short enough to inspect</h3>
              <p className={styles.ingredientLine}>
                <strong>Milk</strong>, milk solids, live yogurt cultures
              </p>
              <p className={styles.panelNote}>Order, additives, and sweeteners are checked.</p>
            </article>

            <article className={`${styles.panel} ${styles.allergenPanel}`}>
              <div className={styles.panelHeader}>
                <span className={styles.index}>03</span>
                <span className={styles.source}>Allergen statement</span>
              </div>
              <div className={styles.allergenReadout}>
                <span>Contains</span>
                <strong>Milk</strong>
                <small>May contain tree nuts</small>
              </div>
            </article>

            <article className={`${styles.panel} ${styles.pricePanel}`}>
              <div className={styles.panelHeader}>
                <span className={styles.index}>04</span>
                <span className={styles.source}>Shelf price</span>
              </div>
              <div className={styles.priceReadout}>
                <div><strong>$4.80</strong><span>pack price</span></div>
                <div><strong>$0.64</strong><span>per 100 g</span></div>
              </div>
            </article>

            <article className={`${styles.panel} ${styles.contextPanel}`}>
              <div className={styles.contextHeading}>
                <div className={styles.panelHeader}>
                  <span className={styles.index}>05—06</span>
                  <span className={styles.source}>Personal context</span>
                </div>
                <h3>The same product can land differently.</h3>
              </div>
              <div className={styles.contextDetails}>
                <div>
                  <span>Your household</span>
                  <strong>High-protein goal</strong>
                  <p>No dairy allergy recorded</p>
                </div>
                <div>
                  <span>Current basket</span>
                  <strong>Two dairy items</strong>
                  <p>Compare before adding another</p>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
