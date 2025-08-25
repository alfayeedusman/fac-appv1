// CMS Data Structure for Admin-Editable Content

export interface CMSContent {
  id: string;
  type: "text" | "image" | "list" | "perk";
  title: string;
  content: string | string[];
  page: "splash" | "home" | "landing" | "dashboard";
  section?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface MemberPerk {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  enabled: boolean;
  order: number;
}

// Default CMS Content
export const defaultCMSContent: CMSContent[] = [
  // Splash Screen Content
  {
    id: "splash_welcome_title",
    type: "text",
    title: "Welcome Title",
    content: "Welcome to Fayeed Auto Care",
    page: "splash",
    section: "welcome",
  },
  {
    id: "splash_welcome_subtitle",
    type: "text",
    title: "Welcome Subtitle",
    content: "Premium Car Care Services",
    page: "splash",
    section: "welcome",
  },

  // Home/Dashboard Content
  {
    id: "home_greeting_text",
    type: "text",
    title: "Greeting Text",
    content: "Ready for your next wash?",
    page: "home",
    section: "header",
  },
  {
    id: "home_upgrade_title",
    type: "text",
    title: "Upgrade Reminder Title",
    content: "Regular Member",
    page: "home",
    section: "upgrade",
  },
  {
    id: "home_upgrade_subtitle",
    type: "text",
    title: "Upgrade Reminder Subtitle",
    content: "Upgrade to unlock premium services!",
    page: "home",
    section: "upgrade",
  },

  // Landing Page Content
  {
    id: "landing_hero_title",
    type: "text",
    title: "Hero Title",
    content: "Premium Auto Care Services",
    page: "landing",
    section: "hero",
  },
  {
    id: "landing_hero_subtitle",
    type: "text",
    title: "Hero Subtitle",
    content:
      "Experience the difference with our professional car care services",
    page: "landing",
    section: "hero",
  },
];

// Default Member Perks
export const defaultMemberPerks: MemberPerk[] = [
  {
    id: "priority_booking",
    title: "Priority Booking",
    description: "Skip the line with exclusive access",
    icon: "Calendar",
    color: "blue-500",
    enabled: true,
    order: 1,
  },
  {
    id: "paint_protection",
    title: "Paint Protection",
    description: "Advanced coating included",
    icon: "Shield",
    color: "green-500",
    enabled: true,
    order: 2,
  },
  {
    id: "vip_lounge",
    title: "VIP Lounge Access",
    description: "Exclusive member area",
    icon: "Crown",
    color: "purple-500",
    enabled: true,
    order: 3,
  },
  {
    id: "member_discounts",
    title: "Member Discounts",
    description: "Save up to 25% on services",
    icon: "Star",
    color: "fac-orange-500",
    enabled: true,
    order: 4,
  },
];

// CMS Utility Functions
export const getCMSContent = (id?: string): CMSContent | CMSContent[] | null => {
  const savedContent = localStorage.getItem("cmsContent");
  const content = savedContent ? JSON.parse(savedContent) : defaultCMSContent;

  if (id) {
    return content.find((item: CMSContent) => item.id === id) || null;
  }

  return content;
};

export const getAllCMSContent = (): CMSContent[] => {
  const savedContent = localStorage.getItem("cmsContent");
  return savedContent ? JSON.parse(savedContent) : defaultCMSContent;
};

export const updateCMSContent = (
  id: string,
  newContent: string | string[],
  updatedBy?: string,
) => {
  const savedContent = localStorage.getItem("cmsContent");
  const content = savedContent ? JSON.parse(savedContent) : defaultCMSContent;

  const index = content.findIndex((item: CMSContent) => item.id === id);
  if (index !== -1) {
    content[index] = {
      ...content[index],
      content: newContent,
      updatedBy: updatedBy || 'admin',
      updatedAt: new Date().toISOString(),
    };
  }

  localStorage.setItem("cmsContent", JSON.stringify(content));
};

export const getMemberPerks = (): MemberPerk[] => {
  const savedPerks = localStorage.getItem("memberPerks");
  return savedPerks ? JSON.parse(savedPerks) : defaultMemberPerks;
};

export const updateMemberPerks = (perks: MemberPerk[], updatedBy?: string) => {
  localStorage.setItem("memberPerks", JSON.stringify(perks));
  localStorage.setItem("memberPerksUpdatedBy", updatedBy || 'admin');
  localStorage.setItem("memberPerksUpdatedAt", new Date().toISOString());
};

// Initialize CMS data if not exists
export const initializeCMSData = () => {
  if (!localStorage.getItem("cmsContent")) {
    localStorage.setItem("cmsContent", JSON.stringify(defaultCMSContent));
  }
  if (!localStorage.getItem("memberPerks")) {
    localStorage.setItem("memberPerks", JSON.stringify(defaultMemberPerks));
  }
};
