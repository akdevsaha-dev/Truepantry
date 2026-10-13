import type { AnchorHTMLAttributes, ReactNode } from "react";

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  tone?: "primary" | "secondary";
};

const baseStyles =
  "inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg border px-[1.35rem] py-3 font-mono text-[0.78rem] leading-none tracking-[0.02em] uppercase transition-[transform,background-color,border-color,box-shadow] duration-150 hover:-translate-y-px active:translate-y-0";

const toneStyles = {
  primary:
    "border-black bg-black !text-white hover:border-neutral-800 hover:bg-neutral-800",
  secondary:
    "border-ink bg-surface !text-ink hover:bg-surface-soft",
} as const;

export function ButtonLink({
  children,
  className = "",
  tone = "primary",
  ...props
}: ButtonLinkProps) {
  return (
    <a
      className={`${baseStyles} ${toneStyles[tone]} ${className}`.trim()}
      {...props}
    >
      {children}
    </a>
  );
}
