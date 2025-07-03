import { useEffect, useState } from "react";
import StickyHeader from "@/components/StickyHeader";
import AdminAdManagement from "@/components/AdminAdManagement";

export default function AdminAds() {
  const [adminEmail, setAdminEmail] = useState("");

  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");
    if (userEmail) {
      setAdminEmail(userEmail);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <StickyHeader showBack={true} title="Ad Management" />

      <div className="px-6 py-8 max-w-4xl mx-auto">
        <AdminAdManagement adminEmail={adminEmail} />
      </div>
    </div>
  );
}
