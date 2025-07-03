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
import { Link } from "react-router-dom";
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
import {
  CMSContent,
  MemberPerk,
  getCMSContent,
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

  const userEmail = localStorage.getItem("userEmail") || "";

  useEffect(() => {
    initializeCMSData();
    loadCMSContent();
    loadMemberPerks();
  }, []);

  const loadCMSContent = () => {
    const savedContent = localStorage.getItem("cmsContent");
    setCmsContent(savedContent ? JSON.parse(savedContent) : defaultCMSContent);
  };

  const loadMemberPerks = () => {
    setMemberPerks(getMemberPerks());
  };

  const handleUpdateContent = (id: string, content: string) => {
    updateCMSContent(id, content, userEmail);
    loadCMSContent();
    setEditingContent("");
    toast({
      title: "Content Updated",
      description: "Content has been successfully updated.",
    });
  };

  const handleUpdatePerks = () => {
    updateMemberPerks(memberPerks, userEmail);
    setEditingPerks(false);
    toast({
      title: "Member Perks Updated",
      description: "Member perks have been successfully updated.",
    });
  };

  const handleAddPerk = () => {
    if (newPerk.title && newPerk.description && newPerk.icon && newPerk.color) {
      const perk: MemberPerk = {
        id: `perk_${Date.now()}`,
        title: newPerk.title,
        description: newPerk.description,
        icon: newPerk.icon,
        color: newPerk.color,
        enabled: true,
        order: memberPerks.length + 1,
      };
      setMemberPerks([...memberPerks, perk]);
      setNewPerk({});
    }
  };

  const handleDeletePerk = (id: string) => {
    setMemberPerks(memberPerks.filter((perk) => perk.id !== id));
  };

  const handleTogglePerk = (id: string) => {
    setMemberPerks(
      memberPerks.map((perk) =>
        perk.id === id ? { ...perk, enabled: !perk.enabled } : perk,
      ),
    );
  };

  const renderIcon = (iconName: string) => {
    const Icon = iconMap[iconName as keyof typeof iconMap] || Star;
    return <Icon className="h-5 w-5" />;
  };

  return (
    <div className="min-h-screen bg-background flex">
      <StickyHeader showBack={true} title="CMS Management" backTo="/admin-dashboard" />

      {/* Admin Sidebar */}
      <AdminSidebar
        activeTab="cms"
        onTabChange={(tab) => {
          if (tab === "overview") navigate("/admin-dashboard");
          else if (tab === "inventory") navigate("/inventory-management");
          else if (tab === "push-notifications") navigate("/admin-push-notifications");
          else if (tab === "gamification") navigate("/admin-gamification");
          else if (tab === "subscription-approval") navigate("/admin-subscription-approval");
          else if (tab === "pos") navigate("/pos");
          else if (tab === "user-management") navigate("/admin-user-management");
        }}
        userRole={localStorage.getItem("userRole") || "admin"}
        notificationCount={0}
      />

      <div className="flex-1 lg:ml-64 min-h-screen">
        <div className="p-6 mt-16">

      <div className="px-4 sm:px-6 py-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link to="/admin-dashboard" className="mr-4">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center space-x-4">
            <div className="bg-fac-orange-500 p-3 rounded-xl">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                CMS Management
              </h1>
              <p className="text-muted-foreground">
                Manage all app content and member perks
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="content" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              value="content"
              className="flex items-center space-x-2"
            >
              <FileText className="h-4 w-4" />
              <span>Content Management</span>
            </TabsTrigger>
            <TabsTrigger value="perks" className="flex items-center space-x-2">
              <Star className="h-4 w-4" />
              <span>Member Perks</span>
            </TabsTrigger>
          </TabsList>

          {/* Content Management Tab */}
          <TabsContent value="content" className="space-y-6">
            <div className="grid gap-6">
              {["splash", "home", "landing"].map((page) => {
                const pageContent = cmsContent.filter(
                  (item) => item.page === page,
                );
                return (
                  <Card key={page} className="border shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center text-xl font-bold text-foreground">
                        <div className="bg-fac-orange-500 p-2 rounded-lg mr-3">
                          <FileText className="h-5 w-5 text-white" />
                        </div>
                        {page.charAt(0).toUpperCase() + page.slice(1)} Page
                        Content
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {pageContent.map((item) => (
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
                                    const updatedContent = cmsContent.map(
                                      (c) =>
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
                              <div className="bg-muted rounded-lg p-3">
                                <p className="text-sm text-foreground whitespace-pre-wrap">
                                  {typeof item.content === "string"
                                    ? item.content
                                    : item.content.join("\n")}
                                </p>
                              </div>
                            )}

                            {item.updatedBy && (
                              <div className="mt-2 text-xs text-muted-foreground">
                                Last updated by {item.updatedBy} on{" "}
                                {new Date(
                                  item.updatedAt || "",
                                ).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Member Perks Tab */}
          <TabsContent value="perks" className="space-y-6">
            <Card className="border shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-xl font-bold text-foreground">
                    <div className="bg-fac-orange-500 p-2 rounded-lg mr-3">
                      <Star className="h-5 w-5 text-white" />
                    </div>
                    Member Perks Management
                  </CardTitle>
                  <Button
                    onClick={() => setEditingPerks(!editingPerks)}
                    variant={editingPerks ? "outline" : "default"}
                    className={
                      editingPerks
                        ? ""
                        : "bg-fac-orange-500 hover:bg-fac-orange-600 text-white"
                    }
                  >
                    {editingPerks ? "Cancel" : "Edit Perks"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Current Perks */}
                  <div className="grid gap-4">
                    {memberPerks.map((perk, index) => (
                      <div key={perk.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`bg-${perk.color} p-2 rounded-lg`}>
                              {renderIcon(perk.icon)}
                            </div>
                            <div>
                              {editingPerks ? (
                                <div className="space-y-2">
                                  <Input
                                    value={perk.title}
                                    onChange={(e) => {
                                      const updated = memberPerks.map((p) =>
                                        p.id === perk.id
                                          ? { ...p, title: e.target.value }
                                          : p,
                                      );
                                      setMemberPerks(updated);
                                    }}
                                    className="font-semibold"
                                  />
                                  <Input
                                    value={perk.description}
                                    onChange={(e) => {
                                      const updated = memberPerks.map((p) =>
                                        p.id === perk.id
                                          ? {
                                              ...p,
                                              description: e.target.value,
                                            }
                                          : p,
                                      );
                                      setMemberPerks(updated);
                                    }}
                                    className="text-sm"
                                  />
                                </div>
                              ) : (
                                <div>
                                  <h4 className="font-semibold text-foreground">
                                    {perk.title}
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    {perk.description}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant={perk.enabled ? "default" : "secondary"}
                            >
                              {perk.enabled ? "Enabled" : "Disabled"}
                            </Badge>
                            {editingPerks && (
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleTogglePerk(perk.id)}
                                >
                                  {perk.enabled ? "Disable" : "Enable"}
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="outline" size="sm">
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
                                        onClick={() =>
                                          handleDeletePerk(perk.id)
                                        }
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add New Perk */}
                  {editingPerks && (
                    <div className="border rounded-lg p-4 bg-muted/50">
                      <h4 className="font-semibold text-foreground mb-4 flex items-center">
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Perk
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="newPerkTitle">Title</Label>
                          <Input
                            id="newPerkTitle"
                            value={newPerk.title || ""}
                            onChange={(e) =>
                              setNewPerk({ ...newPerk, title: e.target.value })
                            }
                            placeholder="Enter perk title"
                          />
                        </div>
                        <div>
                          <Label htmlFor="newPerkDescription">
                            Description
                          </Label>
                          <Input
                            id="newPerkDescription"
                            value={newPerk.description || ""}
                            onChange={(e) =>
                              setNewPerk({
                                ...newPerk,
                                description: e.target.value,
                              })
                            }
                            placeholder="Enter perk description"
                          />
                        </div>
                        <div>
                          <Label htmlFor="newPerkIcon">Icon</Label>
                          <Select
                            onValueChange={(value) =>
                              setNewPerk({ ...newPerk, icon: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select icon" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.keys(iconMap).map((iconName) => (
                                <SelectItem key={iconName} value={iconName}>
                                  <div className="flex items-center space-x-2">
                                    {renderIcon(iconName)}
                                    <span>{iconName}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="newPerkColor">Color</Label>
                          <Select
                            onValueChange={(value) =>
                              setNewPerk({ ...newPerk, color: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select color" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="blue-500">Blue</SelectItem>
                              <SelectItem value="green-500">Green</SelectItem>
                              <SelectItem value="purple-500">Purple</SelectItem>
                              <SelectItem value="fac-orange-500">
                                Orange
                              </SelectItem>
                              <SelectItem value="red-500">Red</SelectItem>
                              <SelectItem value="yellow-500">Yellow</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button
                        onClick={handleAddPerk}
                        className="mt-4 bg-fac-orange-500 hover:bg-fac-orange-600 text-white"
                        disabled={
                          !newPerk.title ||
                          !newPerk.description ||
                          !newPerk.icon ||
                          !newPerk.color
                        }
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Perk
                      </Button>
                    </div>
                  )}

                  {/* Save Changes */}
                  {editingPerks && (
                    <div className="flex justify-end space-x-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditingPerks(false);
                          loadMemberPerks();
                        }}
                      >
                        Cancel Changes
                      </Button>
                      <Button
                        onClick={handleUpdatePerks}
                        className="bg-fac-orange-500 hover:bg-fac-orange-600 text-white"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save All Changes
                      </Button>
                    </div>
                  )}
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
}