import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  subtitle?: string;
  className?: string;
  href?: string;
  inverted?: boolean;
};

const sizes = {
  sm: { box: 36, img: 36, title: "text-sm", sub: "text-[10px]" },
  md: { box: 40, img: 40, title: "text-sm", sub: "text-[10px]" },
  lg: { box: 44, img: 44, title: "text-base", sub: "text-xs" },
};

export function BrandLogo({
  size = "md",
  showText = true,
  subtitle = "Dashboard",
  className,
  href,
  inverted = false,
}: BrandLogoProps) {
  const s = sizes[size];

  const content = (
    <>
      <Image
        src="/logo.png"
        alt={`${siteConfig.name} Logo`}
        width={s.img}
        height={s.img}
        className={cn("shrink-0 rounded-lg object-cover", className)}
        priority
      />
      {showText ? (
        <div className="min-w-0">
          <p
            className={cn(
              "truncate font-bold",
              s.title,
              inverted ? "text-white" : "text-brand-dark",
            )}
          >
            Time Zone
          </p>
          {subtitle ? (
            <p
              className={cn(
                "truncate",
                s.sub,
                inverted ? "text-white/50" : "text-foreground/50",
              )}
            >
              {subtitle}
            </p>
          ) : null}
        </div>
      ) : null}
    </>
  );

  if (href) {
    return (
      <Link href={href} className="flex items-center gap-3">
        {content}
      </Link>
    );
  }

  return <div className="flex items-center gap-3">{content}</div>;
}
