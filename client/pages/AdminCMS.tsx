import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Edit,
  Plus,
  Trash2,
  Settings,
  FileText,
  Star,
  Calendar,
  Shield,
  Crown,
  Gift,
  Sparkles,
} from "lucide-react";
import StickyHeader from "@/components/StickyHeader";
import AdminSidebar from "@/components/AdminSidebar";
import {
  CMSContent,
  MemberPerk,
  getAllCMSContent,
  updateCMSContent,
  getMemberPerks,
  updateMemberPerks,
  initializeCMSData,
  defaultCMSContent,
} from "@/utils/cmsData";
import { toast } from "@/hooks/use-toast";

const iconMap = {
  Calendar,
  Shield,
  Crown,
  Star,
  Gift,
  Sparkles,
};

export default function AdminCMS() {
  const navigate = useNavigate();
  const [cmsContent, setCmsContent] = useState<CMSContent[]>([]);
  const [memberPerks, setMemberPerks] = useState<MemberPerk[]>([]);
  const [editingContent, setEditingContent] = useState<string>("");
  const [editingPerks, setEditingPerks] = useState<boolean>(false);
  const [newPerk, setNewPerk] = useState<Partial<MemberPerk>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  const userEmail = localStorage.getItem("userEmail") || "";

  useEffect(() => {
    const initializeData = async () => {
      try {
        setIsLoading(true);
        setHasError(false);
        initializeCMSData();
        loadCMSContent();
        loadMemberPerks();
      } catch (error) {
        console.error('Error initializing CMS data:', error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, []);

  const loadCMSContent = () => {
    try {
      const content = getAllCMSContent();
      setCmsContent(Array.isArray(content) ? content : []);
    } catch (error) {
      console.error('Error loading CMS content:', error);
      setCmsContent([]);
    }
  };

  const loadMemberPerks = () => {
    try {
      const perks = getMemberPerks();
      setMemberPerks(Array.isArray(perks) ? perks : []);
    } catch (error) {
      console.error('Error loading member perks:', error);
      setMemberPerks([]);
    }
  };

  const handleUpdateContent = (contentId: string, newContent: string) => {
    try {
      updateCMSContent(contentId, newContent, userEmail);
      loadCMSContent();
      setEditingContent("");
      toast({
        title: "Content Updated! 🎉",
        description: "The content has been successfully updated.",
      });
    } catch (error) {
      console.error('Error updating content:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update content. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddPerk = () => {
    if (!newPerk.title || !newPerk.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const perk: MemberPerk = {
      id: `perk_${Date.now()}`,
      title: newPerk.title!,
      description: newPerk.description!,
      icon: newPerk.icon || "Gift",
      color: newPerk.color || "#3B82F6",
      enabled: true,
    };

    const updatedPerks = [...memberPerks, perk];
    updateMemberPerks(updatedPerks, userEmail);
    setMemberPerks(updatedPerks);
    setNewPerk({});
    setEditingPerks(false);

    toast({
      title: "Perk Added! ✨",
      description: "New member perk has been added successfully.",
    });
  };

  const handleDeletePerk = (id: string) => {
    const updatedPerks = memberPerks.filter((perk) => perk.id !== id);
    updateMemberPerks(updatedPerks, userEmail);
    setMemberPerks(updatedPerks);
    toast({
      title: "Perk Deleted",
      description: "The member perk has been removed.",
    });
  };

  const handleTogglePerk = (id: string) => {
    const updatedPerks = memberPerks.map((perk) =>
      perk.id === id ? { ...perk, enabled: !perk.enabled } : perk,
    );
    updateMemberPerks(updatedPerks, userEmail);
    setMemberPerks(updatedPerks);
  };

  const renderIcon = (iconName: string) => {
    const Icon = iconMap[iconName as keyof typeof iconMap] || Star;
    return <Icon className="h-5 w-5" />;
  };

  return (
    <div className="min-h-screen bg-background flex">
      <StickyHeader
        showBack={true}
        title="CMS Management"
        backTo="/admin-dashboard"
      />

      {/* Admin Sidebar */}
      <AdminSidebar
        activeTab="cms"
        onTabChange={(tab) => {
          if (tab === "overview") navigate("/admin-dashboard");
          else if (tab === "inventory") navigate("/inventory-management");
          else if (tab === "push-notifications")
            navigate("/admin-push-notifications");
          else if (tab === "gamification") navigate("/admin-gamification");
          else if (tab === "subscription-approval")
            navigate("/admin-subscription-approval");
          else if (tab === "pos") navigate("/pos");
          else if (tab === "user-management")
            navigate("/admin-user-management");
        }}
        userRole={localStorage.getItem("userRole") || "admin"}
        notificationCount={0}
      />

      <div className="flex-1 lg:ml-64 min-h-screen">
        <div className="p-6 mt-16">
          <Tabs defaultValue="content" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="content">Page Content</TabsTrigger>
              <TabsTrigger value="perks">Member Perks</TabsTrigger>
            </TabsList>

            {/* Page Content Tab */}
            <TabsContent value="content" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-6 w-6 mr-2 text-fac-orange-500" />
                    Website Content Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Array.isArray(cmsContent) && cmsContent.length > 0 ? cmsContent.map((item) => (
                      <div key={item.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-foreground">
                              {item.title}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {item.section && `Section: ${item.section}`}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setEditingContent(
                                editingContent === item.id ? "" : item.id,
                              )
                            }
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            {editingContent === item.id ? "Cancel" : "Edit"}
                          </Button>
                        </div>

                        {editingContent === item.id ? (
                          <div className="space-y-3">
                            <Textarea
                              value={
                                typeof item.content === "string"
                                  ? item.content
                                  : item.content.join("\n")
                              }
                              onChange={(e) => {
                                const updatedContent = cmsContent.map((c) =>
                                  c.id === item.id
                                    ? { ...c, content: e.target.value }
                                    : c,
                                );
                                setCmsContent(updatedContent);
                              }}
                              className="min-h-[100px]"
                            />
                            <Button
                              onClick={() =>
                                handleUpdateContent(
                                  item.id,
                                  typeof item.content === "string"
                                    ? item.content
                                    : item.content.join("\n"),
                                )
                              }
                              className="bg-fac-orange-500 hover:bg-fac-orange-600 text-white"
                            >
                              <Save className="h-4 w-4 mr-2" />
                              Save Changes
                            </Button>
                          </div>
                        ) : (
                          <div className="bg-muted p-3 rounded">
                            <p className="text-sm text-foreground">
                              {typeof item.content === "string"
                                ? item.content
                                : item.content.join(" ")}
                            </p>
                          </div>
                        )}
                      </div>
                    )) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No CMS content available</p>
                        <p className="text-sm">Content will be loaded automatically</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Member Perks Tab */}
            <TabsContent value="perks" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Crown className="h-6 w-6 mr-2 text-fac-orange-500" />
                      Member Perks & Benefits
                    </span>
                    <Button
                      onClick={() => setEditingPerks(!editingPerks)}
                      className="bg-fac-orange-500 hover:bg-fac-orange-600 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {editingPerks ? "Cancel" : "Add Perk"}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Add New Perk Form */}
                  {editingPerks && (
                    <div className="mb-6 p-4 border rounded-lg bg-muted/50">
                      <h4 className="font-semibold mb-4">
                        Add New Member Perk
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="perkTitle">Perk Title</Label>
                          <Input
                            id="perkTitle"
                            placeholder="VIP Priority Access"
                            value={newPerk.title || ""}
                            onChange={(e) =>
                              setNewPerk({ ...newPerk, title: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="perkIcon">Icon</Label>
                          <Select
                            value={newPerk.icon || "Gift"}
                            onValueChange={(value) =>
                              setNewPerk({ ...newPerk, icon: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.keys(iconMap).map((iconName) => (
                                <SelectItem key={iconName} value={iconName}>
                                  <div className="flex items-center">
                                    {renderIcon(iconName)}
                                    <span className="ml-2">{iconName}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="perkDescription">Description</Label>
                          <Textarea
                            id="perkDescription"
                            placeholder="Describe the benefit..."
                            value={newPerk.description || ""}
                            onChange={(e) =>
                              setNewPerk({
                                ...newPerk,
                                description: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="perkColor">Color</Label>
                          <Input
                            id="perkColor"
                            type="color"
                            value={newPerk.color || "#3B82F6"}
                            onChange={(e) =>
                              setNewPerk({ ...newPerk, color: e.target.value })
                            }
                          />
                        </div>
                        <div className="flex items-end">
                          <Button onClick={handleAddPerk} className="w-full">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Perk
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Existing Perks */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {memberPerks.map((perk) => (
                      <Card key={perk.id} className="relative">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div
                                className="p-2 rounded-lg"
                                style={{ backgroundColor: perk.color }}
                              >
                                {renderIcon(perk.icon)}
                              </div>
                              <div>
                                <h4 className="font-semibold text-foreground">
                                  {perk.title}
                                </h4>
                                <Badge
                                  variant={
                                    perk.enabled ? "default" : "secondary"
                                  }
                                >
                                  {perk.enabled ? "Active" : "Disabled"}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleTogglePerk(perk.id)}
                              >
                                {perk.enabled ? "Disable" : "Enable"}
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Delete Perk
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "
                                      {perk.title}"? This action cannot be
                                      undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeletePerk(perk.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            {perk.description}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
