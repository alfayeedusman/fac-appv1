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
          "inline-flex items-center rounded-full border border-fac-orange-200 bg-fac-orange-50 px-2.5 py-1 text-xs font-semibold text-fac-orange-700 dark:border-orange-900/40 dark:bg-orange-950/30 dark:text-orange-200 " +
          (className || "")
        }
      >
        <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-fac-orange-500" />
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
