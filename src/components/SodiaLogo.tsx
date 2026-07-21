import sodiaLogoImg from "@/assets/sodia-logo.png";

interface SodiaLogoProps {
  /** Size of the logo image (square). Defaults to 36px */
  size?: number;
  /** Whether to show the text wordmark next to the logo. Defaults to true */
  showText?: boolean;
  /** Extra className for the wrapper */
  className?: string;
}

/**
 * Reusable Sodia AI logo: robot mascot image + "SodiaAI" wordmark.
 * Drop-in replacement for the old Sparkles icon logo.
 */
export function SodiaLogo({ size = 36, showText = true, className = "" }: SodiaLogoProps) {
  return (
    <span className={`flex items-center gap-2 ${className}`} style={{ lineHeight: 1 }}>
      <img
        src={sodiaLogoImg}
        alt="Sodia AI logo"
        width={size}
        height={size}
        style={{ objectFit: "contain", flexShrink: 0 }}
        draggable={false}
      />
      {showText && (
        <span className="font-display font-semibold tracking-tight" style={{ fontSize: size * 0.5 }}>
          Sodia<span className="text-gradient">AI</span>
        </span>
      )}
    </span>
  );
}
