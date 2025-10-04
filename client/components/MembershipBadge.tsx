import React from "react";
import { Crown } from "lucide-react";

interface MembershipBadgeProps {
  membershipType: string;
  className?: string;
}

export default function MembershipBadge({ membershipType, className }: MembershipBadgeProps) {
  const type = (membershipType || "").toLowerCase();
  const isRegular = type.includes("regular");
  const isClassic = type.includes("classic");
  const isSilver = type.includes("silver");
  const isGold = type.includes("gold");

  if (isRegular) {
    return (
      <span
        className={
          "inline-flex items-center rounded-full border border-border bg-muted/70 px-2.5 py-1 text-xs font-medium text-foreground/80 dark:bg-neutral-900/50 " +
          (className || "")
        }
      >
        <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-foreground/60" />
        Regular Member
      </span>
    );
  }

  if (isClassic) {
    return (
      <span
        className={
          "inline-flex items-center rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm " +
          (className || "")
        }
      >
        <Crown className="mr-1.5 h-3 w-3 opacity-90" /> Classic
      </span>
    );
  }

  if (isSilver) {
    return (
      <span
        className={
          "inline-flex items-center rounded-full bg-gradient-to-r from-gray-400 to-gray-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm " +
          (className || "")
        }
      >
        <Crown className="mr-1.5 h-3 w-3 opacity-90" /> VIP Silver
      </span>
    );
  }

  if (isGold) {
    return (
      <span
        className={
          "inline-flex items-center rounded-full bg-gradient-to-r from-yellow-500 to-fac-orange-500 px-2.5 py-1 text-xs font-semibold text-white shadow-sm " +
          (className || "")
        }
      >
        <Crown className="mr-1.5 h-3 w-3 opacity-90" /> VIP Gold
      </span>
    );
  }

  return (
    <span
      className={
        "inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-semibold text-foreground " +
        (className || "")
      }
    >
      {membershipType}
    </span>
  );
}
