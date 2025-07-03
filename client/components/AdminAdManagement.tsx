import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Ad,
  createAd,
  getAds,
  updateAd,
  deleteAd,
  formatAdDuration,
  getAdExpiryDate,
  isAdValid,
} from "@/utils/adsUtils";
import AdBanner from "./AdBanner";

interface AdminAdManagementProps {
  adminEmail: string;
}

export default function AdminAdManagement({
  adminEmail,
}: AdminAdManagementProps) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewAd, setPreviewAd] = useState<Ad | null>(null);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    imageUrl: "",
    duration: "monthly" as Ad["duration"],
    targetPages: ["welcome"] as Ad["targetPages"],
    isActive: true,
  });

  useEffect(() => {
    loadAds();
  }, []);

  const loadAds = () => {
    const allAds = getAds();
    setAds(allAds);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      imageUrl: "",
      duration: "monthly",
      targetPages: ["welcome"],
      isActive: true,
    });
    setEditingAd(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingAd) {
      updateAd(editingAd.id, formData);
    } else {
      createAd({
        ...formData,
        adminEmail,
      });
    }

    loadAds();
    setIsCreateModalOpen(false);
    resetForm();
  };

  const handleEdit = (ad: Ad) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      content: ad.content,
      imageUrl: ad.imageUrl || "",
      duration: ad.duration,
      targetPages: ad.targetPages,
      isActive: ad.isActive,
    });
    setIsCreateModalOpen(true);
  };

  const handleDelete = (adId: string) => {
    if (confirm("Are you sure you want to delete this ad?")) {
      deleteAd(adId);
      loadAds();
    }
  };

  const handlePreview = (ad: Ad) => {
    setPreviewAd(ad);
    setIsPreviewModalOpen(true);
  };

  const handleTargetPageChange = (
    page: "welcome" | "dashboard",
    checked: boolean,
  ) => {
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        targetPages: [...prev.targetPages, page],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        targetPages: prev.targetPages.filter((p) => p !== page),
      }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Ad Management</h2>
          <p className="text-muted-foreground">
            Create and manage promotional ads
          </p>
        </div>

        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-fac-orange-500 hover:bg-fac-orange-600">
              <Plus className="h-4 w-4 mr-2" />
              Create Ad
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingAd ? "Edit Ad" : "Create New Ad"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Ad Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Enter ad title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Ad Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      content: e.target.value,
                    }))
                  }
                  placeholder="Enter ad description"
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL (Optional)</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      imageUrl: e.target.value,
                    }))
                  }
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Select
                  value={formData.duration}
                  onValueChange={(value: Ad["duration"]) =>
                    setFormData((prev) => ({ ...prev, duration: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">1 Week</SelectItem>
                    <SelectItem value="monthly">1 Month</SelectItem>
                    <SelectItem value="yearly">1 Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Target Pages</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.targetPages.includes("welcome")}
                      onCheckedChange={(checked) =>
                        handleTargetPageChange("welcome", checked)
                      }
                    />
                    <Label className="text-sm">Welcome Page</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.targetPages.includes("dashboard")}
                      onCheckedChange={(checked) =>
                        handleTargetPageChange("dashboard", checked)
                      }
                    />
                    <Label className="text-sm">Dashboard/Home Page</Label>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, isActive: checked }))
                  }
                />
                <Label className="text-sm">Active</Label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    resetForm();
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-fac-orange-500 hover:bg-fac-orange-600"
                  disabled={
                    !formData.title ||
                    !formData.content ||
                    formData.targetPages.length === 0
                  }
                >
                  {editingAd ? "Update Ad" : "Create Ad"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {ads.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-muted-foreground">
                <div className="text-4xl mb-4">📢</div>
                <h3 className="text-lg font-semibold mb-2">
                  No ads created yet
                </h3>
                <p className="text-sm">
                  Create your first promotional ad to get started
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          ads.map((ad) => {
            const isValid = isAdValid(ad);
            const expiryDate = getAdExpiryDate(ad);

            return (
              <Card
                key={ad.id}
                className={cn(
                  "transition-all duration-200",
                  isValid
                    ? "border-green-200 dark:border-green-800"
                    : "border-red-200 dark:border-red-800",
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{ad.title}</CardTitle>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        Created: {new Date(ad.createdAt).toLocaleDateString()}
                        <Clock className="h-3 w-3 ml-2" />
                        Expires: {expiryDate.toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={isValid ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {isValid ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Expired
                          </>
                        )}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {formatAdDuration(ad.duration)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {ad.content}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      {ad.targetPages.map((page) => (
                        <Badge
                          key={page}
                          variant="secondary"
                          className="text-xs"
                        >
                          <MapPin className="h-3 w-3 mr-1" />
                          {page}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePreview(ad)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(ad)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(ad.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Preview Modal */}
      <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Ad Preview</DialogTitle>
          </DialogHeader>
          {previewAd && (
            <AdBanner
              ad={previewAd}
              userEmail={adminEmail}
              variant="inline"
              onDismiss={() => setIsPreviewModalOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
