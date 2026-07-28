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
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-a4.png"
        alt=""
        style={{ width: size * 0.97, height: size * 1.0 }}
        className="shrink-0"
      />
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
