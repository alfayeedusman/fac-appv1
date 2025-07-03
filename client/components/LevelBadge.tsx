import { cn } from "@/lib/utils";
import { CustomerLevel } from "@/utils/gamificationData";

interface LevelBadgeProps {
  level: CustomerLevel;
  size?: "sm" | "md" | "lg" | "xl";
  showName?: boolean;
  animated?: boolean;
  className?: string;
}

export default function LevelBadge({
  level,
  size = "md",
  showName = true,
  animated = false,
  className,
}: LevelBadgeProps) {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-sm",
    lg: "w-16 h-16 text-base",
    xl: "w-24 h-24 text-xl",
  };

  const iconSizes = {
    sm: "text-xs",
    md: "text-lg",
    lg: "text-2xl",
    xl: "text-4xl",
  };

  const renderBadgeShape = () => {
    const baseClasses = cn(
      "flex items-center justify-center font-bold text-white relative overflow-hidden transition-all duration-300",
      sizeClasses[size],
      animated && "hover:scale-110 cursor-pointer",
      className,
    );

    const gradientClasses = `bg-gradient-to-br ${level.gradient}`;
    const glowClasses =
      level.badge.pattern === "glow"
        ? `shadow-lg shadow-${level.color}/50 animate-pulse-glow`
        : "";

    switch (level.badge.shape) {
      case "circle":
        return (
          <div
            className={cn(
              baseClasses,
              "rounded-full",
              gradientClasses,
              glowClasses,
            )}
          >
            <span className={iconSizes[size]}>{level.icon}</span>
            {level.badge.pattern === "striped" && (
              <div className="absolute inset-0 bg-white/10 bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,rgba(255,255,255,0.1)_2px,rgba(255,255,255,0.1)_4px)] rounded-full"></div>
            )}
          </div>
        );

      case "shield":
        return (
          <div
            className={cn(
              baseClasses,
              "rounded-t-full",
              gradientClasses,
              glowClasses,
            )}
            style={{
              clipPath:
                "polygon(50% 0%, 0% 25%, 0% 75%, 50% 100%, 100% 75%, 100% 25%)",
            }}
          >
            <span className={iconSizes[size]}>{level.icon}</span>
            {level.badge.pattern === "striped" && (
              <div
                className="absolute inset-0 bg-white/10 bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,rgba(255,255,255,0.1)_2px,rgba(255,255,255,0.1)_4px)]"
                style={{
                  clipPath:
                    "polygon(50% 0%, 0% 25%, 0% 75%, 50% 100%, 100% 75%, 100% 25%)",
                }}
              ></div>
            )}
          </div>
        );

      case "star":
        return (
          <div
            className={cn(baseClasses, gradientClasses, glowClasses)}
            style={{
              clipPath:
                "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
            }}
          >
            <span className={iconSizes[size]}>{level.icon}</span>
            {level.badge.pattern === "striped" && (
              <div
                className="absolute inset-0 bg-white/10 bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,rgba(255,255,255,0.1)_2px,rgba(255,255,255,0.1)_4px)]"
                style={{
                  clipPath:
                    "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
                }}
              ></div>
            )}
          </div>
        );

      case "crown":
        return (
          <div
            className={cn(baseClasses, gradientClasses, glowClasses)}
            style={{
              clipPath:
                "polygon(0% 100%, 15% 25%, 35% 50%, 50% 15%, 65% 50%, 85% 25%, 100% 100%)",
            }}
          >
            <span className={iconSizes[size]}>{level.icon}</span>
            {level.badge.pattern === "glow" && (
              <>
                <div className="absolute inset-0 bg-white/20 animate-pulse rounded-sm"></div>
                <div className="absolute inset-1 bg-gradient-to-t from-transparent to-white/30 rounded-sm"></div>
              </>
            )}
          </div>
        );

      default:
        return (
          <div
            className={cn(
              baseClasses,
              "rounded-lg",
              gradientClasses,
              glowClasses,
            )}
          >
            <span className={iconSizes[size]}>{level.icon}</span>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      {renderBadgeShape()}
      {showName && (
        <div className="text-center">
          <p
            className={cn(
              "font-bold",
              size === "sm"
                ? "text-xs"
                : size === "md"
                  ? "text-sm"
                  : "text-base",
            )}
            style={{ color: level.color }}
          >
            {level.name}
          </p>
        </div>
      )}
    </div>
  );
}
