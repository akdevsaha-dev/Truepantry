import { ScanDemo } from "@/components/landing/scan-demo";
import {
  landingInner,
  landingSection,
  sectionHeading,
  sectionKicker,
  sectionLede,
} from "@/lib/landing-styles";

export function ProductStory() {
  return (
    <section
      className={landingSection}
      id="product"
      aria-labelledby="product-heading"
    >
      <div
        className={`${landingInner} grid items-center gap-[clamp(2.5rem,5vw,6rem)] min-[1025px]:grid-cols-2`}
      >
        <div className="flex flex-col justify-between gap-10">
          <div>
            <p className={sectionKicker}>A recommendation you can inspect</p>
            <h2 id="product-heading" className={`${sectionHeading} mb-4`}>
              One product. Different answers for different priorities.
            </h2>
            <p className={`${sectionLede} mb-8 max-w-lg`}>
              Carted does not hand out a generic health score. It identifies the
              exact item, shows the facts behind its answer, and explains how well
              it fits the goal you chose for this shop.
            </p>
          </div>

          <dl className="grid gap-5">
            <div className="grid gap-1.5 border-t border-line pt-5 min-[561px]:grid-cols-[7.5rem_1fr] min-[561px]:gap-4">
              <dt className="font-semibold tracking-[-0.02em]">What it reads</dt>
              <dd className="m-0 leading-[1.55] text-ink-soft">
                Serving size, ingredients, allergens, nutrition, pack size, and
                shelf price.
              </dd>
            </div>
            <div className="grid gap-1.5 border-t border-line pt-5 min-[561px]:grid-cols-[7.5rem_1fr] min-[561px]:gap-4">
              <dt className="font-semibold tracking-[-0.02em]">What you get</dt>
              <dd className="m-0 leading-[1.55] text-ink-soft">
                A clear fit, caution, or comparison—plus the specific reason
                behind it.
              </dd>
            </div>
          </dl>
        </div>

        <div className="flex w-full justify-end" data-parallax>
          <ScanDemo />
        </div>
      </div>
    </section>
  );
}
