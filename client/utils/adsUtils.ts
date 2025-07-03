export interface Ad {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  duration: "weekly" | "monthly" | "yearly";
  createdAt: string;
  isActive: boolean;
  targetPages: ("welcome" | "dashboard")[];
  adminEmail: string;
}

export interface AdDismissal {
  adId: string;
  dismissedAt: string;
  userEmail: string;
}

const ADS_STORAGE_KEY = "fayeed_ads";
const AD_DISMISSALS_STORAGE_KEY = "fayeed_ad_dismissals";

export function createAd(adData: Omit<Ad, "id" | "createdAt">): Ad {
  const id = `ad_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const ad: Ad = {
    ...adData,
    id,
    createdAt: new Date().toISOString(),
  };

  const existingAds = getAds();
  existingAds.push(ad);
  localStorage.setItem(ADS_STORAGE_KEY, JSON.stringify(existingAds));

  return ad;
}

export function getAds(): Ad[] {
  try {
    const ads = localStorage.getItem(ADS_STORAGE_KEY);
    return ads ? JSON.parse(ads) : [];
  } catch {
    return [];
  }
}

export function updateAd(adId: string, updates: Partial<Ad>): boolean {
  const ads = getAds();
  const adIndex = ads.findIndex((ad) => ad.id === adId);

  if (adIndex === -1) return false;

  ads[adIndex] = { ...ads[adIndex], ...updates };
  localStorage.setItem(ADS_STORAGE_KEY, JSON.stringify(ads));
  return true;
}

export function deleteAd(adId: string): boolean {
  const ads = getAds();
  const filteredAds = ads.filter((ad) => ad.id !== adId);

  if (filteredAds.length === ads.length) return false;

  localStorage.setItem(ADS_STORAGE_KEY, JSON.stringify(filteredAds));
  return true;
}

export function isAdValid(ad: Ad): boolean {
  if (!ad.isActive) return false;

  const createdDate = new Date(ad.createdAt);
  const now = new Date();

  switch (ad.duration) {
    case "weekly":
      const oneWeekLater = new Date(createdDate);
      oneWeekLater.setDate(oneWeekLater.getDate() + 7);
      return now <= oneWeekLater;

    case "monthly":
      const oneMonthLater = new Date(createdDate);
      oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
      return now <= oneMonthLater;

    case "yearly":
      const oneYearLater = new Date(createdDate);
      oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
      return now <= oneYearLater;

    default:
      return false;
  }
}

export function getActiveAdsForPage(page: "welcome" | "dashboard"): Ad[] {
  const allAds = getAds();
  return allAds.filter((ad) => isAdValid(ad) && ad.targetPages.includes(page));
}

export function dismissAd(adId: string, userEmail: string): void {
  const dismissals = getAdDismissals();
  const dismissal: AdDismissal = {
    adId,
    dismissedAt: new Date().toISOString(),
    userEmail,
  };

  dismissals.push(dismissal);
  localStorage.setItem(AD_DISMISSALS_STORAGE_KEY, JSON.stringify(dismissals));
}

export function getAdDismissals(): AdDismissal[] {
  try {
    const dismissals = localStorage.getItem(AD_DISMISSALS_STORAGE_KEY);
    return dismissals ? JSON.parse(dismissals) : [];
  } catch {
    return [];
  }
}

export function isAdDismissedByUser(adId: string, userEmail: string): boolean {
  const dismissals = getAdDismissals();
  return dismissals.some((d) => d.adId === adId && d.userEmail === userEmail);
}

export function getVisibleAdsForUser(
  page: "welcome" | "dashboard",
  userEmail: string,
): Ad[] {
  const activeAds = getActiveAdsForPage(page);
  return activeAds.filter((ad) => !isAdDismissedByUser(ad.id, userEmail));
}

export function formatAdDuration(duration: Ad["duration"]): string {
  switch (duration) {
    case "weekly":
      return "1 Week";
    case "monthly":
      return "1 Month";
    case "yearly":
      return "1 Year";
    default:
      return "Unknown";
  }
}

export function getAdExpiryDate(ad: Ad): Date {
  const createdDate = new Date(ad.createdAt);

  switch (ad.duration) {
    case "weekly":
      const oneWeekLater = new Date(createdDate);
      oneWeekLater.setDate(oneWeekLater.getDate() + 7);
      return oneWeekLater;

    case "monthly":
      const oneMonthLater = new Date(createdDate);
      oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
      return oneMonthLater;

    case "yearly":
      const oneYearLater = new Date(createdDate);
      oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
      return oneYearLater;

    default:
      return new Date();
  }
}
