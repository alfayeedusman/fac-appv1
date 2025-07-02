import { ReactNode } from "react";
import MobileNav from "./MobileNav";

interface MobileLayoutProps {
  children: ReactNode;
  showNav?: boolean;
}

export default function MobileLayout({
  children,
  showNav = true,
}: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-fac-orange-50">
      <div className="pb-16 md:pb-0">{children}</div>
      {showNav && <MobileNav />}
    </div>
  );
}
