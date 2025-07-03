import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Star,
  Award,
  Target,
  Crown,
  Zap,
  ChevronRight,
} from "lucide-react";
import LevelBadge from "./LevelBadge";
import {
  CustomerLevel,
  UserProgress,
  getUserProgress,
  getLevelProgress,
  updateUserProgress,
  getGamificationLevels,
  getCurrentLevel,
  getNextLevel,
} from "@/utils/gamificationData";

interface LevelProgressProps {
  userId: string;
  showDetails?: boolean;
  compact?: boolean;
}

export default function LevelProgress({
  userId,
  showDetails = true,
  compact = false,
}: LevelProgressProps) {
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [levelProgress, setLevelProgress] = useState<{
    current: CustomerLevel;
    next: CustomerLevel | null;
    progress: number;
  } | null>(null);
  const [showRewards, setShowRewards] = useState(false);

  useEffect(() => {
    loadUserProgress();
  }, [userId]);

  const loadUserProgress = () => {
    try {
      const progress = updateUserProgress(userId); // This will recalculate based on current bookings
      const levelInfo = getLevelProgress(progress.completedBookings);
      setUserProgress(progress);
      setLevelProgress(levelInfo);
    } catch (error) {
      console.error("Error loading user progress:", error);
      // Set default values on error
      const defaultProgress: UserProgress = {
        userId,
        currentLevel: "newbie",
        totalBookings: 0,
        completedBookings: 0,
        nextLevelBookings: 3,
        earnedRewards: [],
        badges: ["newbie"],
        rank: 4,
        joinDate: new Date().toISOString(),
      };
      setUserProgress(defaultProgress);

      const levels = getGamificationLevels();
      const currentLevel = getCurrentLevel(0, levels);
      const nextLevel = getNextLevel(currentLevel.id, levels);
      setLevelProgress({
        current: currentLevel,
        next: nextLevel,
        progress: 0,
      });
    }
  };

  if (!userProgress || !levelProgress) {
    return (
      <Card className="glass border-border animate-pulse">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-muted rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-2 bg-muted rounded w-full"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { current, next, progress } = levelProgress;

  if (compact) {
    return (
      <div className="flex items-center space-x-3 p-3 glass rounded-lg border-border">
        <LevelBadge level={current} size="sm" showName={false} animated />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-semibold text-foreground truncate">
              {current.name} Level
            </p>
            <p className="text-xs text-muted-foreground">
              {userProgress.completedBookings} washes
            </p>
          </div>
          {next && (
            <div className="space-y-1">
              <Progress
                value={progress}
                className="h-2"
                style={{
                  background: `linear-gradient(to right, ${current.color}20, ${next.color}20)`,
                }}
              />
              <p className="text-xs text-muted-foreground">
                {userProgress.nextLevelBookings} more to {next.name}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className="glass border-border hover-lift transition-all duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-foreground">
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-fac-orange-500 to-purple-500 p-2 rounded-lg">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <span>Your Journey</span>
          </div>
          <Badge
            variant="outline"
            className={`border-[${current.color}] text-[${current.color}]`}
          >
            Rank #{userProgress.rank}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Level */}
        <div className="flex items-center space-x-4">
          <LevelBadge level={current} size="lg" showName={false} animated />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3
                className="text-xl font-bold"
                style={{ color: current.color }}
              >
                {current.name}
              </h3>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">
                  {userProgress.completedBookings}
                </p>
                <p className="text-sm text-muted-foreground">car washes</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              {current.description}
            </p>

            {/* Progress to Next Level */}
            {next ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Progress to {next.name}
                  </span>
                  <span className="font-semibold text-foreground">
                    {Math.round(progress)}%
                  </span>
                </div>
                <div className="relative">
                  <Progress
                    value={progress}
                    className="h-3"
                    style={{
                      background: `linear-gradient(to right, ${current.color}20, ${next.color}20)`,
                    }}
                  />
                  <div
                    className="absolute top-0 left-0 h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${progress}%`,
                      background: `linear-gradient(to right, ${current.color}, ${next.color})`,
                    }}
                  ></div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {userProgress.nextLevelBookings} more car washes to reach{" "}
                  <span style={{ color: next.color }} className="font-semibold">
                    {next.name}
                  </span>
                </p>
              </div>
            ) : (
              <div className="flex items-center space-x-2 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg">
                <Crown className="h-5 w-5 text-yellow-500" />
                <p className="text-sm font-semibold text-foreground">
                  🎉 Maximum level reached! You're a Legend!
                </p>
              </div>
            )}
          </div>
        </div>

        {showDetails && (
          <>
            {/* Current Rewards */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-foreground flex items-center space-x-2">
                  <Award className="h-4 w-4 text-fac-orange-500" />
                  <span>Your Rewards</span>
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRewards(!showRewards)}
                  className="text-fac-orange-500 hover:text-fac-orange-600"
                >
                  {showRewards ? "Hide" : "Show"}
                  <ChevronRight
                    className={`h-4 w-4 ml-1 transition-transform ${
                      showRewards ? "rotate-90" : ""
                    }`}
                  />
                </Button>
              </div>

              {showRewards && (
                <div className="space-y-2">
                  {current.rewards.map((reward, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg"
                    >
                      <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                        <Star className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <p className="text-sm text-foreground">{reward}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Next Level Preview */}
            {next && (
              <div className="p-4 border border-dashed border-muted-foreground/30 rounded-lg bg-muted/20">
                <div className="flex items-center space-x-3 mb-3">
                  <LevelBadge level={next} size="md" showName={false} />
                  <div>
                    <h4 className="font-semibold" style={{ color: next.color }}>
                      Next: {next.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {next.minBookings} car washes required
                    </p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    Preview rewards:
                  </p>
                  {next.rewards.slice(0, 2).map((reward, index) => (
                    <p
                      key={index}
                      className="text-xs text-muted-foreground flex items-center space-x-1"
                    >
                      <Zap className="h-3 w-3" />
                      <span>{reward}</span>
                    </p>
                  ))}
                  {next.rewards.length > 2 && (
                    <p className="text-xs text-muted-foreground">
                      +{next.rewards.length - 2} more rewards...
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">
                  {userProgress.totalBookings}
                </p>
                <p className="text-xs text-muted-foreground">Total Bookings</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">
                  {userProgress.badges.length}
                </p>
                <p className="text-xs text-muted-foreground">Badges Earned</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">
                  #{userProgress.rank}
                </p>
                <p className="text-xs text-muted-foreground">Global Rank</p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
