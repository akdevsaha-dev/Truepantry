import Link from "next/link";

export function FinalCta() {
  return (
    <section
      className="relative flex w-full items-center justify-center overflow-hidden rounded-xl bg-[url('/images/cta-bg.png')] bg-cover bg-center bg-no-repeat px-4 py-16"
      aria-labelledby="final-cta-heading"
    >
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <p className="mb-4 inline-flex items-center gap-2 font-mono text-xs font-medium tracking-[0.05em] text-neutral-900 uppercase">
          <svg
            aria-hidden="true"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 0C10.1952 5.43992 14.5601 9.80475 20 10C14.5601 10.1952 10.1952 14.5601 10 20C9.80475 14.5601 5.43992 10.1952 0 10C5.43992 9.80475 9.80475 5.43992 10 0Z"
              fill="currentColor"
            />
          </svg>
          Shop with fewer second guesses
        </p>
        <h2
          id="final-cta-heading"
          className="mb-11 text-balance text-[clamp(2rem,4vw,3.75rem)] leading-[1.15] font-medium tracking-[-0.04em] text-neutral-900"
        >
          Bring one goal to your next grocery run
        </h2>
        <div className="flex w-full flex-col items-center justify-center gap-4 min-[641px]:w-auto min-[641px]:flex-row">
          <Link
            href="#product"
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-black px-5 font-mono text-sm font-medium !text-white uppercase transition-colors duration-200 hover:bg-neutral-800 min-[641px]:w-auto"
          >
            Start with Free
            <svg
              aria-hidden="true"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15.3581 4.46332C15.2893 4.41722 15.2113 4.38389 15.1273 4.36675L15.1156 4.36557C15.0812 4.3593 15.0464 4.35582 15.0115 4.35512L14.9968 4.35364L7.50083 4.35156C7.14186 4.35144 6.85049 4.64175 6.85021 5.00053C6.85008 5.35922 7.14069 5.6504 7.49945 5.65087L13.4311 5.65267L4.54155 14.5422C4.28781 14.7961 4.28843 15.2075 4.54224 15.4613C4.79605 15.7151 5.20749 15.7158 5.46134 15.462L14.3465 6.57691L14.3482 12.4967C14.3484 12.8556 14.6405 13.1465 14.9996 13.1464C15.3584 13.146 15.6489 12.8548 15.6488 12.4961L15.6467 5.0544C15.6605 4.87194 15.5976 4.68478 15.4582 4.54536C15.427 4.51418 15.3935 4.48684 15.3581 4.46332Z"
                fill="currentColor"
              />
            </svg>
          </Link>
          <Link
            href="#pricing"
            className="inline-flex h-11 w-full items-center justify-center rounded-lg border border-neutral-900 bg-white px-5 font-mono text-sm font-medium !text-neutral-900 uppercase transition-colors duration-200 hover:bg-neutral-100 min-[641px]:w-auto"
          >
            Compare plans
          </Link>
        </div>
      </div>
    </section>
  );
}
