const apiBase = import.meta.env.VITE_API_BASE_URL || "/api";
const gamificationBaseUrl = `${apiBase}/gamification`;

export interface CustomerLevel {
  id: string;
  name: string;
  minBookings: number;
  maxBookings?: number;
  color: string;
  gradient: string;
  icon: string;
  description: string;
  rewards: string[];
  badge: {
    shape: "circle" | "shield" | "star" | "crown";
    pattern: "solid" | "gradient" | "striped" | "glow";
  };
  isActive?: boolean;
}

export interface UserProgress {
  userId: string;
  currentLevel: string;
  totalBookings: number;
  completedBookings: number;
  nextLevelBookings: number;
  earnedRewards: string[];
  badges: string[];
  rank: number;
  joinDate: string;
}

// Default gamification levels
const defaultLevels: CustomerLevel[] = [
  {
    id: "newbie",
    name: "Newbie",
    minBookings: 0,
    maxBookings: 2,
    color: "#9CA3AF",
    gradient: "from-gray-400 to-gray-600",
    icon: "🚗",
    description: "Welcome to FAC! Start your car care journey",
    rewards: ["5% discount on next booking", "Welcome bonus points"],
    badge: {
      shape: "circle",
      pattern: "solid",
    },
    isActive: true,
  },
  {
    id: "rookie",
    name: "Rookie",
    minBookings: 3,
    maxBookings: 9,
    color: "#10B981",
    gradient: "from-green-400 to-green-600",
    icon: "🌟",
    description: "Getting the hang of regular car care",
    rewards: [
      "10% discount on bookings",
      "Priority booking slots",
      "Free air freshener",
    ],
    badge: {
      shape: "shield",
      pattern: "gradient",
    },
    isActive: true,
  },
  {
    id: "pro",
    name: "Pro",
    minBookings: 10,
    maxBookings: 24,
    color: "#3B82F6",
    gradient: "from-blue-400 to-blue-600",
    icon: "⭐",
    description: "Professional car care enthusiast",
    rewards: [
      "15% discount on all services",
      "Free premium wax upgrade",
      "Monthly loyalty bonus",
      "VIP customer support",
    ],
    badge: {
      shape: "star",
      pattern: "glow",
    },
    isActive: true,
  },
  {
    id: "legend",
    name: "Legend",
    minBookings: 25,
    color: "#F59E0B",
    gradient: "from-yellow-400 to-orange-500",
    icon: "👑",
    description: "Elite car care legend - the ultimate level",
    rewards: [
      "20% discount on all services",
      "Free monthly detail service",
      "Exclusive Legend member events",
      "Personal car care consultant",
      "Custom loyalty rewards",
    ],
    badge: {
      shape: "crown",
      pattern: "glow",
    },
    isActive: true,
  },
];

const normalizeLevel = (level: any): CustomerLevel => {
  const color = level.badge_color ?? level.badgeColor ?? "#6B7280";
  const gradient =
    level.gradient ?? level.level_color ?? "from-gray-400 to-gray-600";

  return {
    id: level.id,
    name: level.name || "Level",
    minBookings: level.min_points ?? level.minPoints ?? 0,
    maxBookings: level.max_points ?? level.maxPoints ?? undefined,
    color,
    gradient,
    icon: level.badge_icon ?? level.badgeIcon ?? "⭐",
    description: level.description || "",
    rewards: level.special_perks ?? level.specialPerks ?? [],
    badge: {
      shape: level.badge_shape ?? level.badgeShape ?? "circle",
      pattern: level.badge_pattern ?? level.badgePattern ?? "solid",
    },
    isActive: level.is_active ?? level.isActive ?? true,
  };
};

const buildLevelPayload = (level: CustomerLevel) => ({
  name: level.name,
  description: level.description,
  minPoints: level.minBookings,
  maxPoints: level.maxBookings ?? null,
  discountPercentage: 0,
  priority: 0,
  specialPerks: level.rewards,
  badgeIcon: level.icon,
  badgeColor: level.color,
  levelColor: level.gradient,
  gradient: level.gradient,
  badgeShape: level.badge.shape,
  badgePattern: level.badge.pattern,
  isActive: level.isActive ?? true,
  sortOrder: level.minBookings,
});

export const getGamificationLevels = async (): Promise<CustomerLevel[]> => {
  try {
    const response = await fetch(
      `${gamificationBaseUrl}/levels?isActive=true`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      },
    );

    const data = await response.json();
    if (!response.ok || !data?.success) {
      throw new Error(data?.error || "Failed to fetch levels");
    }

    const levels = (data.levels || []).map(normalizeLevel);
    return levels.length > 0 ? levels : defaultLevels;
  } catch (error) {
    console.error("Error loading gamification levels:", error);
    return defaultLevels;
  }
};

export const createGamificationLevel = async (
  level: CustomerLevel,
): Promise<{ success: boolean; level?: CustomerLevel; error?: string }> => {
  try {
    const response = await fetch(`${gamificationBaseUrl}/levels`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildLevelPayload(level)),
    });

    const data = await response.json();
    if (!response.ok || !data?.success) {
      return { success: false, error: data?.error || "Failed to create level" };
    }

    return { success: true, level: normalizeLevel(data.level) };
  } catch (error: any) {
    console.error("Error creating gamification level:", error);
    return { success: false, error: error.message || "Network error" };
  }
};

export const updateGamificationLevel = async (
  levelId: string,
  level: CustomerLevel,
): Promise<{ success: boolean; level?: CustomerLevel; error?: string }> => {
  try {
    const response = await fetch(`${gamificationBaseUrl}/levels/${levelId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildLevelPayload(level)),
    });

    const data = await response.json();
    if (!response.ok || !data?.success) {
      return { success: false, error: data?.error || "Failed to update level" };
    }

    return { success: true, level: normalizeLevel(data.level) };
  } catch (error: any) {
    console.error("Error updating gamification level:", error);
    return { success: false, error: error.message || "Network error" };
  }
};

export const updateGamificationLevels = async (
  levels: CustomerLevel[],
  persistedIds: Set<string> = new Set(),
): Promise<{ success: boolean; levels?: CustomerLevel[]; error?: string }> => {
  const results = await Promise.all(
    levels.map((level) =>
      persistedIds.has(level.id)
        ? updateGamificationLevel(level.id, level)
        : createGamificationLevel(level),
    ),
  );

  const failures = results.filter((result) => !result.success);
  if (failures.length > 0) {
    return {
      success: false,
      error: failures[0]?.error || "Failed to save gamification levels",
    };
  }

  return {
    success: true,
    levels: results
      .map((result) => result.level)
      .filter((level): level is CustomerLevel => Boolean(level)),
  };
};

export const getUserProgress = async (
  userId: string,
  levels?: CustomerLevel[],
): Promise<UserProgress> => {
  const resolvedLevels = levels ?? (await getGamificationLevels());
  const dashboardResponse = await fetch(
    `${gamificationBaseUrl}/dashboard/${userId}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    },
  ).then((response) => response.json());

  if (!dashboardResponse?.success) {
    throw new Error(dashboardResponse?.error || "Failed to load progress");
  }

  const dashboard = dashboardResponse.dashboard || {};
  const points = dashboard.userPoints || 0;
  const currentLevel = dashboard.currentLevel
    ? normalizeLevel(dashboard.currentLevel)
    : getCurrentLevel(points, resolvedLevels);
  const nextLevel = dashboard.nextLevel
    ? normalizeLevel(dashboard.nextLevel)
    : getNextLevel(currentLevel.id, resolvedLevels);

  return {
    userId,
    currentLevel: currentLevel.id,
    totalBookings: points,
    completedBookings: points,
    nextLevelBookings: nextLevel
      ? Math.max(0, nextLevel.minBookings - points)
      : 0,
    earnedRewards: currentLevel.rewards,
    badges: [currentLevel.id],
    rank: calculateUserRank(currentLevel.id, resolvedLevels),
    joinDate: new Date().toISOString(),
  };
};

export const getCurrentLevel = (
  points: number,
  levels: CustomerLevel[],
): CustomerLevel => {
  if (!levels.length) {
    return defaultLevels[0];
  }

  for (let i = levels.length - 1; i >= 0; i--) {
    const level = levels[i];
    if (points >= level.minBookings) {
      return level;
    }
  }

  return levels[0];
};

export const getNextLevel = (
  currentLevelId: string,
  levels: CustomerLevel[],
): CustomerLevel | null => {
  const currentIndex = levels.findIndex((level) => level.id === currentLevelId);

  if (currentIndex === -1 || currentIndex === levels.length - 1) {
    return null;
  }

  return levels[currentIndex + 1];
};

export const calculateUserRank = (
  currentLevelId: string,
  levels: CustomerLevel[],
): number => {
  if (!levels.length) return 1;
  const index = levels.findIndex((level) => level.id === currentLevelId);
  if (index === -1) return levels.length;
  return levels.length - index;
};

export const getLevelProgress = (
  points: number,
  levels: CustomerLevel[],
): { current: CustomerLevel; next: CustomerLevel | null; progress: number } => {
  const current = getCurrentLevel(points, levels);
  const next = getNextLevel(current.id, levels);

  let progress = 100;
  if (next) {
    const levelBookings = points - current.minBookings;
    const levelRange = next.minBookings - current.minBookings;
    progress = Math.min(100, (levelBookings / levelRange) * 100);
  }

  return { current, next, progress };
};

export const getDefaultGamificationLevels = (): CustomerLevel[] =>
  defaultLevels;
