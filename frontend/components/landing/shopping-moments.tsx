import {
  landingInner,
  landingSection,
  sectionHeading,
  sectionKicker,
} from "@/lib/landing-styles";

const moments = [
  {
    context: "Choosing breakfast",
    title: "Compare cereals by the bowl you actually pour",
    description:
      "See added sugar and fibre per realistic serving, then check unit price before a family-size box earns the cheaper badge.",
  },
  {
    context: "Shopping with an allergy",
    title: "Catch the warning hidden below the ingredients",
    description:
      "Keep a household allergy on your profile and Carted surfaces contains and may-contain statements before anything else.",
  },
  {
    context: "Staying on budget",
    title: "Know when the larger pack is not the better buy",
    description:
      "Compare price per 100 g and factor in how quickly your household is likely to use it, not just the number on the sale sticker.",
  },
] as const;

const cardColors = ["bg-soft-green", "bg-soft-purple", "bg-soft-pink"] as const;

export function ShoppingMoments() {
  return (
    <section
      className={landingSection}
      id="moments"
      aria-labelledby="moments-heading"
    >
      <div className={landingInner}>
        <div className="mb-[clamp(2.5rem,5vw,4rem)] grid gap-5 min-[901px]:grid-cols-[1.25fr_0.75fr] min-[901px]:gap-x-[clamp(2rem,7vw,7rem)]">
          <p className={`${sectionKicker} mb-0 min-[901px]:col-span-2`}>
            Built for ordinary grocery decisions
          </p>
          <h2 id="moments-heading" className={sectionHeading}>
            Useful when two products both look like the right choice
          </h2>
          <p className="self-end text-[1.05rem] leading-[1.6] text-ink-soft">
            Carted is for the thirty-second decisions that happen under fluorescent
            lights, with a basket in one hand and two nearly identical labels in the
            other.
          </p>
        </div>

        <div className="grid gap-4 min-[901px]:grid-cols-3">
          {moments.map((moment, index) => (
            <article
              className={`flex min-h-80 flex-col rounded-xl p-6 min-[901px]:min-h-96 ${cardColors[index]}`}
              key={moment.context}
            >
              <span className="mb-auto font-mono text-xs text-ink-soft" aria-hidden="true">
                0{index + 1}
              </span>
              <p className="mt-8 mb-2 text-[0.78rem] font-semibold text-ink-soft">
                {moment.context}
              </p>
              <h3 className="mb-4 text-[clamp(1.45rem,2vw,1.85rem)] leading-[1.2] font-medium tracking-[-0.035em]">
                {moment.title}
              </h3>
              <p className="text-[0.95rem] leading-[1.6] text-ink-soft">
                {moment.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
