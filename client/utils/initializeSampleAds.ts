import { createAd, getAds } from "./adsUtils";

export function initializeSampleAds() {
  const existingAds = getAds();

  // Only create sample ads if none exist
  if (existingAds.length === 0) {
    console.log("🎨 Creating sample ads for demonstration...");

    // Sample Ad 1: Welcome Page - New Service Promotion
    createAd({
      title: "🚗 New Graphene Coating Service!",
      content:
        "Experience the ultimate paint protection with our new graphene coating technology. Get 50% off your first graphene treatment this month!",
      imageUrl:
        "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=400&fit=crop",
      duration: "monthly",
      targetPages: ["welcome"],
      isActive: true,
      adminEmail: "superyeed@fayeedautocare.com",
    });

    // Sample Ad 2: Dashboard - VIP Membership Upgrade
    createAd({
      title: "⭐ Upgrade to VIP Gold Ultimate",
      content:
        "Unlock unlimited classic washes, premium services, and exclusive member benefits. Join our VIP Gold community today!",
      imageUrl:
        "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800&h=400&fit=crop",
      duration: "yearly",
      targetPages: ["dashboard"],
      isActive: true,
      adminEmail: "superyeed@fayeedautocare.com",
    });

    // Sample Ad 3: Both Pages - Grand Opening Promo
    createAd({
      title: "🎉 Grand Opening - Boalan Branch!",
      content:
        "We're excited to announce our new branch in Boalan! Book your first wash and get a complimentary interior detailing service.",
      imageUrl:
        "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&h=400&fit=crop",
      duration: "weekly",
      targetPages: ["welcome", "dashboard"],
      isActive: true,
      adminEmail: "adminyeed@fayeedautocare.com",
    });

    // Sample Ad 4: Dashboard - Seasonal Promotion
    createAd({
      title: "🌞 Summer Car Care Package",
      content:
        "Beat the heat with our special summer package! Includes exterior wash, UV protection coating, and interior cooling treatment.",
      imageUrl:
        "https://images.unsplash.com/photo-1469285994282-454ceb49e63c?w=800&h=400&fit=crop",
      duration: "monthly",
      targetPages: ["dashboard"],
      isActive: true,
      adminEmail: "adminyeed@fayeedautocare.com",
    });

    // Sample Ad 5: Welcome Page - Mobile App Download
    createAd({
      title: "📱 Download Our Mobile App",
      content:
        "Get the Fayeed Auto Care mobile app for easier booking, exclusive app-only deals, and loyalty rewards tracking!",
      imageUrl:
        "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=400&fit=crop",
      duration: "yearly",
      targetPages: ["welcome"],
      isActive: true,
      adminEmail: "superyeed@fayeedautocare.com",
    });

    console.log("✅ Sample ads created successfully!");
    console.log("📍 Ads are now visible on Welcome and Dashboard pages");
    console.log("🔧 Use the Admin Dashboard to manage these ads");
  } else {
    console.log("📋 Existing ads found, skipping sample ad creation");
  }
}
