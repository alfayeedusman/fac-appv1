// Import bookings utility functions
const getBookingsData = () => {
  try {
    const stored = localStorage.getItem("fac_bookings");
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error loading bookings:", error);
    return [];
  }
};

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
  },
];

export const getGamificationLevels = (): CustomerLevel[] => {
  const stored = localStorage.getItem("fac_gamification_levels");
  if (stored) {
    return JSON.parse(stored);
  }

  // Initialize with default levels
  localStorage.setItem(
    "fac_gamification_levels",
    JSON.stringify(defaultLevels),
  );
  return defaultLevels;
};

export const updateGamificationLevels = (levels: CustomerLevel[]): void => {
  localStorage.setItem("fac_gamification_levels", JSON.stringify(levels));
};

export const getUserProgress = (userId: string): UserProgress => {
  const stored = localStorage.getItem(`fac_user_progress_${userId}`);
  if (stored) {
    return JSON.parse(stored);
  }

  // Calculate progress based on completed bookings
  const bookings = getBookingsData();
  const userBookings = bookings.filter((b: any) => b.status === "completed");
  const completedCount = userBookings.length;

  const levels = getGamificationLevels();
  const currentLevel = getCurrentLevel(completedCount, levels);
  const nextLevel = getNextLevel(currentLevel.id, levels);

  const progress: UserProgress = {
    userId,
    currentLevel: currentLevel.id,
    totalBookings: bookings.length,
    completedBookings: completedCount,
    nextLevelBookings: nextLevel ? nextLevel.minBookings - completedCount : 0,
    earnedRewards: currentLevel.rewards,
    badges: [currentLevel.id],
    rank: calculateUserRank(completedCount),
    joinDate: new Date().toISOString(),
  };

  localStorage.setItem(`fac_user_progress_${userId}`, JSON.stringify(progress));
  return progress;
};

export const getCurrentLevel = (
  completedBookings: number,
  levels?: CustomerLevel[],
): CustomerLevel => {
  const gamificationLevels = levels || getGamificationLevels();

  for (let i = gamificationLevels.length - 1; i >= 0; i--) {
    const level = gamificationLevels[i];
    if (completedBookings >= level.minBookings) {
      return level;
    }
  }

  return gamificationLevels[0]; // Return newbie if no match
};

export const getNextLevel = (
  currentLevelId: string,
  levels?: CustomerLevel[],
): CustomerLevel | null => {
  const gamificationLevels = levels || getGamificationLevels();
  const currentIndex = gamificationLevels.findIndex(
    (l) => l.id === currentLevelId,
  );

  if (currentIndex === -1 || currentIndex === gamificationLevels.length - 1) {
    return null; // No next level
  }

  return gamificationLevels[currentIndex + 1];
};

export const updateUserProgress = (userId: string): UserProgress => {
  const bookings = getBookingsData();
  const userBookings = bookings.filter((b: any) => b.status === "completed");
  const completedCount = userBookings.length;

  const levels = getGamificationLevels();
  const currentLevel = getCurrentLevel(completedCount, levels);
  const nextLevel = getNextLevel(currentLevel.id, levels);

  const existingProgress = getUserProgress(userId);

  const updatedProgress: UserProgress = {
    ...existingProgress,
    currentLevel: currentLevel.id,
    totalBookings: bookings.length,
    completedBookings: completedCount,
    nextLevelBookings: nextLevel
      ? Math.max(0, nextLevel.minBookings - completedCount)
      : 0,
    earnedRewards: currentLevel.rewards,
    badges: Array.from(new Set([...existingProgress.badges, currentLevel.id])),
    rank: calculateUserRank(completedCount),
  };

  localStorage.setItem(
    `fac_user_progress_${userId}`,
    JSON.stringify(updatedProgress),
  );
  return updatedProgress;
};

export const calculateUserRank = (completedBookings: number): number => {
  // Simple ranking system - could be enhanced with more complex logic
  const levels = getGamificationLevels();
  const currentLevel = getCurrentLevel(completedBookings, levels);

  switch (currentLevel.id) {
    case "newbie":
      return 4;
    case "rookie":
      return 3;
    case "pro":
      return 2;
    case "legend":
      return 1;
    default:
      return 4;
  }
};

export const getLevelProgress = (
  completedBookings: number,
): { current: CustomerLevel; next: CustomerLevel | null; progress: number } => {
  const levels = getGamificationLevels();
  const current = getCurrentLevel(completedBookings, levels);
  const next = getNextLevel(current.id, levels);

  let progress = 100;
  if (next) {
    const levelBookings = completedBookings - current.minBookings;
    const levelRange = next.minBookings - current.minBookings;
    progress = Math.min(100, (levelBookings / levelRange) * 100);
  }

  return { current, next, progress };
};

export const checkLevelUp = (
  previousBookings: number,
  currentBookings: number,
): CustomerLevel | null => {
  const levels = getGamificationLevels();
  const previousLevel = getCurrentLevel(previousBookings, levels);
  const currentLevel = getCurrentLevel(currentBookings, levels);

  if (previousLevel.id !== currentLevel.id) {
    return currentLevel;
  }

  return null;
};
