import Link from "next/link";

interface BrandLogoProps {
  href?: string;
  size?: "sm" | "md" | "lg";
  theme?: "dark" | "light";
  showDot?: boolean;
  className?: string;
}

export function BrandLogo({
  href = "/",
  size = "md",
  theme = "dark",
  showDot = false,
  className = "",
}: BrandLogoProps) {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-[27px]",
    lg: "text-3xl",
  }[size];

  const badgeSize = {
    sm: "size-6 text-sm",
    md: "size-8 text-xl",
    lg: "size-9 text-2xl",
  }[size];

  const themeClasses =
    theme === "light"
      ? "text-white"
      : "text-[#171717]";

  const badgeTheme =
    theme === "light"
      ? "bg-white text-black"
      : "bg-[#171717] text-white";

  return (
    <Link
      href={href}
      className={`inline-flex min-h-11 items-center gap-[9px] font-[650] tracking-[-0.06em] transition-opacity hover:opacity-90 ${sizeClasses} ${themeClasses} ${className}`.trim()}
      aria-label="Carted home"
    >
      <span
        className={`grid place-items-center rounded-full font-bold ${badgeSize} ${badgeTheme}`}
        aria-hidden="true"
      >
        c
      </span>
      <span>carted</span>
      {showDot && (
        <span className="text-xs font-semibold text-[#54754b]" aria-hidden="true">
          ®
        </span>
      )}
    </Link>
  );
}
