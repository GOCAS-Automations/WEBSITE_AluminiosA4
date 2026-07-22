import { cn } from "@/lib/format";

export function Logo({
  size = 38,
  showText = true,
  tone = "dark",
  className,
}: {
  size?: number;
  showText?: boolean;
  tone?: "dark" | "light";
  className?: string;
}) {
  const word = tone === "light" ? "#ffffff" : "#22323c";
  const wordAccent = tone === "light" ? "#eafbfd" : "#1fa9b7";
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg
        width={size}
        height={size * 1.16}
        viewBox="0 0 120 140"
        aria-hidden="true"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="a4g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#4FD6E2" />
            <stop offset="1" stopColor="#2BBDCB" />
          </linearGradient>
        </defs>
        <path
          d="M24,6 H96 A18,18 0 0 1 114,24 V92 C114,104 108,110 99,116 L66,137 C62,139.5 58,139.5 54,137 L21,116 C12,110 6,104 6,92 V24 A18,18 0 0 1 24,6 Z"
          fill="url(#a4g)"
          stroke="#FFFFFF"
          strokeWidth="5"
        />
        <g
          fill="none"
          stroke="#EAFBFD"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M60,33 L39,97" />
          <path d="M60,33 L81,97" />
          <path d="M45,79 L75,79" />
        </g>
      </svg>
      {showText && (
        <span
          className="font-extrabold tracking-tight leading-none text-[1.15rem] sm:text-[1.25rem]"
          style={{ color: word }}
        >
          ALUMINIOS
          <span className="font-bold ml-1" style={{ color: wordAccent }}>
            A4
          </span>
        </span>
      )}
    </span>
  );
}

export default Logo;
