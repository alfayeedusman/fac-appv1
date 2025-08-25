import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Save,
  Trophy,
  Settings,
  Users,
  TrendingUp,
  Award,
  Target,
  Palette,
} from "lucide-react";
import LevelBadge from "@/components/LevelBadge";
import {
  CustomerLevel,
  getGamificationLevels,
  updateGamificationLevels,
} from "@/utils/gamificationData";

export default function AdminGamification() {
  const [levels, setLevels] = useState<CustomerLevel[]>([]);
  const [editingLevel, setEditingLevel] = useState<CustomerLevel | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newReward, setNewReward] = useState("");

  useEffect(() => {
    loadLevels();
  }, []);

  const loadLevels = () => {
    const gamificationLevels = getGamificationLevels();
    setLevels(gamificationLevels);
  };

  const saveLevels = () => {
    updateGamificationLevels(levels);
    alert("Gamification levels saved successfully!");
  };

  const createNewLevel = () => {
    const newLevel: CustomerLevel = {
      id: `level_${Date.now()}`,
      name: "New Level",
      minBookings: 0,
      color: "#6B7280",
      gradient: "from-gray-400 to-gray-600",
      icon: "🎯",
      description: "New level description",
      rewards: [],
      badge: {
        shape: "circle",
        pattern: "solid",
      },
    };
    setEditingLevel(newLevel);
    setIsCreating(true);
  };

  const saveLevel = () => {
    if (!editingLevel) return;

    if (isCreating) {
      setLevels([...levels, editingLevel]);
    } else {
      setLevels(
        levels.map((level) =>
          level.id === editingLevel.id ? editingLevel : level,
        ),
      );
    }

    setEditingLevel(null);
    setIsCreating(false);
  };

  const deleteLevel = (levelId: string) => {
    if (window.confirm("Are you sure you want to delete this level?")) {
      setLevels(levels.filter((level) => level.id !== levelId));
    }
  };

  const addReward = () => {
    if (!editingLevel || !newReward.trim()) return;

    setEditingLevel({
      ...editingLevel,
      rewards: [...editingLevel.rewards, newReward.trim()],
    });
    setNewReward("");
  };

  const removeReward = (index: number) => {
    if (!editingLevel) return;

    setEditingLevel({
      ...editingLevel,
      rewards: editingLevel.rewards.filter((_, i) => i !== index),
    });
  };

  const presetColors = [
    { name: "Gray", color: "#6B7280", gradient: "from-gray-400 to-gray-600" },
    {
      name: "Green",
      color: "#10B981",
      gradient: "from-green-400 to-green-600",
    },
    { name: "Blue", color: "#3B82F6", gradient: "from-blue-400 to-blue-600" },
    {
      name: "Purple",
      color: "#8B5CF6",
      gradient: "from-purple-400 to-purple-600",
    },
    {
      name: "Orange",
      color: "#F59E0B",
      gradient: "from-yellow-400 to-orange-500",
    },
    { name: "Red", color: "#EF4444", gradient: "from-red-400 to-red-600" },
    { name: "Pink", color: "#EC4899", gradient: "from-pink-400 to-pink-600" },
    { name: "Teal", color: "#14B8A6", gradient: "from-teal-400 to-teal-600" },
  ];

  const shapeOptions = [
    { value: "circle", label: "Circle" },
    { value: "shield", label: "Shield" },
    { value: "star", label: "Star" },
    { value: "crown", label: "Crown" },
  ];

  const patternOptions = [
    { value: "solid", label: "Solid" },
    { value: "gradient", label: "Gradient" },
    { value: "striped", label: "Striped" },
    { value: "glow", label: "Glow" },
  ];

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in-up">
          <div className="flex items-center space-x-4">
            <Link to="/admin-dashboard">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full glass hover-lift"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="gradient-primary p-3 rounded-xl animate-pulse-glow">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-foreground">
                  Gamification{" "}
                  <span className="bg-gradient-to-r from-fac-orange-500 to-purple-600 bg-clip-text text-transparent">
                    Management
                  </span>
                </h1>
                <p className="text-muted-foreground font-medium">
                  Configure customer levels, badges, and rewards
                </p>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              onClick={createNewLevel}
              className="bg-fac-orange-500 hover:bg-fac-orange-600 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Level
            </Button>
            <Button
              onClick={saveLevels}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-fade-in-up animate-delay-100">
          <Card className="glass border-border">
            <CardContent className="p-6 text-center">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg w-fit mx-auto mb-3">
                <Trophy className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-foreground">
                {levels.length}
              </p>
              <p className="text-sm text-muted-foreground">Total Levels</p>
            </CardContent>
          </Card>

          <Card className="glass border-border">
            <CardContent className="p-6 text-center">
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg w-fit mx-auto mb-3">
                <Award className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-2xl font-bold text-foreground">
                {levels.reduce((sum, level) => sum + level.rewards.length, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Total Rewards</p>
            </CardContent>
          </Card>

          <Card className="glass border-border">
            <CardContent className="p-6 text-center">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg w-fit mx-auto mb-3">
                <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-foreground">
                {Math.max(...levels.map((l) => l.maxBookings || l.minBookings))}
              </p>
              <p className="text-sm text-muted-foreground">Max Milestone</p>
            </CardContent>
          </Card>

          <Card className="glass border-border">
            <CardContent className="p-6 text-center">
              <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-lg w-fit mx-auto mb-3">
                <Users className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <p className="text-2xl font-bold text-foreground">Active</p>
              <p className="text-sm text-muted-foreground">System Status</p>
            </CardContent>
          </Card>
        </div>

        {/* Levels List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {levels
            .sort((a, b) => a.minBookings - b.minBookings)
            .map((level) => (
              <Card
                key={level.id}
                className="glass border-border hover-lift transition-all duration-300"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <LevelBadge level={level} size="md" showName={false} />
                      <div>
                        <CardTitle
                          className="text-lg"
                          style={{ color: level.color }}
                        >
                          {level.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {level.minBookings}
                          {level.maxBookings
                            ? `-${level.maxBookings}`
                            : "+"}{" "}
                          car washes
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingLevel(level)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteLevel(level.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-foreground">{level.description}</p>
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">
                      Rewards ({level.rewards.length}):
                    </p>
                    <div className="space-y-1">
                      {level.rewards.slice(0, 3).map((reward, index) => (
                        <p
                          key={index}
                          className="text-xs text-muted-foreground flex items-center space-x-1"
                        >
                          <span>•</span>
                          <span>{reward}</span>
                        </p>
                      ))}
                      {level.rewards.length > 3 && (
                        <p className="text-xs text-muted-foreground">
                          +{level.rewards.length - 3} more rewards...
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>

        {/* Edit Level Modal */}
        {editingLevel && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="glass max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>{isCreating ? "Create New Level" : "Edit Level"}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="levelName">Level Name</Label>
                    <Input
                      id="levelName"
                      value={editingLevel.name}
                      onChange={(e) =>
                        setEditingLevel({
                          ...editingLevel,
                          name: e.target.value,
                        })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="levelIcon">Icon Emoji</Label>
                    <Input
                      id="levelIcon"
                      value={editingLevel.icon}
                      onChange={(e) =>
                        setEditingLevel({
                          ...editingLevel,
                          icon: e.target.value,
                        })
                      }
                      className="mt-1"
                      placeholder="🎯"
                    />
                  </div>
                </div>

                {/* Booking Requirements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minBookings">Minimum Bookings</Label>
                    <Input
                      id="minBookings"
                      type="number"
                      value={editingLevel.minBookings}
                      onChange={(e) =>
                        setEditingLevel({
                          ...editingLevel,
                          minBookings: parseInt(e.target.value) || 0,
                        })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxBookings">
                      Maximum Bookings (Optional)
                    </Label>
                    <Input
                      id="maxBookings"
                      type="number"
                      value={editingLevel.maxBookings || ""}
                      onChange={(e) =>
                        setEditingLevel({
                          ...editingLevel,
                          maxBookings: e.target.value
                            ? parseInt(e.target.value)
                            : undefined,
                        })
                      }
                      className="mt-1"
                      placeholder="Leave empty for max level"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={editingLevel.description}
                    onChange={(e) =>
                      setEditingLevel({
                        ...editingLevel,
                        description: e.target.value,
                      })
                    }
                    className="mt-1"
                    rows={3}
                  />
                </div>

                {/* Color Selection */}
                <div>
                  <Label>Color Theme</Label>
                  <div className="grid grid-cols-4 gap-3 mt-2">
                    {presetColors.map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() =>
                          setEditingLevel({
                            ...editingLevel,
                            color: preset.color,
                            gradient: preset.gradient,
                          })
                        }
                        className={`p-3 rounded-lg border-2 transition-all ${
                          editingLevel.color === preset.color
                            ? "border-fac-orange-500 scale-105"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                        style={{
                          background: `linear-gradient(135deg, ${preset.color}20, ${preset.color}40)`,
                        }}
                      >
                        <div
                          className="w-6 h-6 rounded-full mx-auto mb-1"
                          style={{ backgroundColor: preset.color }}
                        ></div>
                        <p className="text-xs font-medium">{preset.name}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Badge Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Badge Shape</Label>
                    <Select
                      value={editingLevel.badge.shape}
                      onValueChange={(value: any) =>
                        setEditingLevel({
                          ...editingLevel,
                          badge: { ...editingLevel.badge, shape: value },
                        })
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {shapeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Badge Pattern</Label>
                    <Select
                      value={editingLevel.badge.pattern}
                      onValueChange={(value: any) =>
                        setEditingLevel({
                          ...editingLevel,
                          badge: { ...editingLevel.badge, pattern: value },
                        })
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {patternOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Badge Preview */}
                <div className="flex items-center space-x-4 p-4 bg-muted/30 rounded-lg">
                  <div>
                    <p className="text-sm font-medium mb-2">Badge Preview:</p>
                    <LevelBadge level={editingLevel} size="lg" />
                  </div>
                </div>

                {/* Rewards */}
                <div>
                  <Label>Rewards</Label>
                  <div className="space-y-3 mt-2">
                    {editingLevel.rewards.map((reward, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 p-2 bg-muted/30 rounded-lg"
                      >
                        <p className="flex-1 text-sm">{reward}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeReward(index)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <div className="flex space-x-2">
                      <Input
                        value={newReward}
                        onChange={(e) => setNewReward(e.target.value)}
                        placeholder="Add new reward..."
                        onKeyPress={(e) => e.key === "Enter" && addReward()}
                      />
                      <Button onClick={addReward} disabled={!newReward.trim()}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingLevel(null);
                      setIsCreating(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={saveLevel}
                    className="bg-fac-orange-500 hover:bg-fac-orange-600 text-white"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Level
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
    </div>
  );
}
