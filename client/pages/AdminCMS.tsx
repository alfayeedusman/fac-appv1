import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
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
  Home,
  Image,
  Palette,
  Eye,
  Download,
  Upload,
  RefreshCw,
  Car,
  Droplets,
  MapPin,
  Smartphone,
  Clock,
  CheckCircle,
  Copy,
  ExternalLink,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Comprehensive CMS Data Structure
interface HomepageContent {
  hero: {
    logo: string;
    badge: string;
    mainTitle: string;
    highlightedTitle: string;
    subtitle: string;
    description: string;
    features: Array<{
      id: string;
      icon: string;
      title: string;
      subtitle: string;
      color: string;
    }>;
    ctaButtons: Array<{
      id: string;
      text: string;
      link: string;
      variant: 'primary' | 'secondary' | 'outline';
      enabled: boolean;
    }>;
  };
  services: {
    badge: string;
    title: string;
    highlightedTitle: string;
    description: string;
    items: Array<{
      id: string;
      icon: string;
      title: string;
      description: string;
      gradient: string;
      enabled: boolean;
    }>;
  };
  visionMission: {
    badge: string;
    title: string;
    highlightedTitle: string;
    vision: {
      title: string;
      content: string;
      icon: string;
      gradient: string;
    };
    mission: {
      title: string;
      content: string;
      icon: string;
      gradient: string;
    };
  };
  locations: {
    badge: string;
    title: string;
    highlightedTitle: string;
    description: string;
    branches: Array<{
      id: string;
      name: string;
      location: string;
      gradient: string;
      enabled: boolean;
    }>;
  };
  footer: {
    companyName: string;
    tagline: string;
    poweredBy: string;
    copyright: string;
  };
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  };
}

const defaultHomepageContent: HomepageContent = {
  hero: {
    logo: "https://cdn.builder.io/api/v1/image/assets%2Ff7cf3f8f1c944fbfa1f5031abc56523f%2Faa4bc2d15e574dab80ef472ac32b06f9?format=webp&width=800",
    badge: "Premium",
    mainTitle: "Smart Auto Care",
    highlightedTitle: "for Modern Drivers",
    subtitle: "Premium Quality • Affordable Prices",
    description: "Experience the future of car care with our advanced technology and expert service in Zamboanga City",
    features: [
      { id: "feature1", icon: "Droplets", title: "Premium", subtitle: "Car Wash", color: "#ff6b1f" },
      { id: "feature2", icon: "Clock", title: "Quick", subtitle: "Service", color: "#8b5cf6" },
      { id: "feature3", icon: "Smartphone", title: "Smart", subtitle: "Booking", color: "#3b82f6" }
    ],
    ctaButtons: [
      { id: "cta1", text: "Get Started Free", link: "/signup", variant: "primary", enabled: true },
      { id: "cta2", text: "Login", link: "/login", variant: "outline", enabled: true },
      { id: "cta3", text: "Book Now", link: "/guest-booking", variant: "outline", enabled: true }
    ]
  },
  services: {
    badge: "Our Services",
    title: "Premium Auto Care",
    highlightedTitle: "",
    description: "Professional services designed to keep your vehicle in perfect condition",
    items: [
      {
        id: "service1",
        icon: "Car",
        title: "Car & Motor Wash",
        description: "Premium cleaning with eco-friendly products for a spotless finish",
        gradient: "from-fac-orange-500 to-fac-orange-600",
        enabled: true
      },
      {
        id: "service2",
        icon: "Star",
        title: "Auto Detailing",
        description: "Comprehensive interior and exterior detailing services",
        gradient: "from-purple-500 to-purple-600",
        enabled: true
      },
      {
        id: "service3",
        icon: "Sparkles",
        title: "Headlight Restoration",
        description: "Crystal clear headlights for enhanced visibility and safety",
        gradient: "from-blue-500 to-blue-600",
        enabled: true
      },
      {
        id: "service4",
        icon: "Shield",
        title: "Graphene Coating",
        description: "Advanced protection with long-lasting durability",
        gradient: "from-yellow-500 to-orange-500",
        enabled: true
      }
    ]
  },
  visionMission: {
    badge: "About Us",
    title: "Our Story",
    highlightedTitle: "",
    vision: {
      title: "Our Vision",
      content: "To become Zamboanga's most trusted auto care brand, delivering premium quality services at affordable prices for every car owner.",
      icon: "Crown",
      gradient: "from-fac-orange-500 to-fac-orange-600"
    },
    mission: {
      title: "Our Mission",
      content: "Committed to excellence in auto detailing and protection, treating every vehicle with care while exceeding customer expectations.",
      icon: "Star",
      gradient: "from-purple-500 to-purple-600"
    }
  },
  locations: {
    badge: "Locations",
    title: "Visit Our Branches",
    highlightedTitle: "",
    description: "Conveniently located across Zamboanga City",
    branches: [
      {
        id: "branch1",
        name: "Tumaga Branch",
        location: "Air Bell Subdivision",
        gradient: "from-fac-orange-500 to-fac-orange-600",
        enabled: true
      },
      {
        id: "branch2",
        name: "Boalan Branch",
        location: "Besides Divisoria Checkpoint",
        gradient: "from-purple-500 to-purple-600",
        enabled: true
      }
    ]
  },
  footer: {
    companyName: "Fayeed Auto Care",
    tagline: "Zamboanga's First Smart Carwash & Auto Detailing Service",
    poweredBy: "Fdigitals",
    copyright: "© 2025 Fayeed Auto Care"
  },
  theme: {
    primaryColor: "#ff6b1f",
    secondaryColor: "#8b5cf6",
    accentColor: "#3b82f6"
  }
};

const iconOptions = [
  "Car", "Droplets", "Star", "MapPin", "Shield", "Crown", "Gift", "Sparkles", 
  "Smartphone", "Clock", "CheckCircle", "Calendar", "Settings", "Zap"
];

const gradientOptions = [
  "from-fac-orange-500 to-fac-orange-600",
  "from-purple-500 to-purple-600",
  "from-blue-500 to-blue-600",
  "from-green-500 to-green-600",
  "from-yellow-500 to-orange-500",
  "from-pink-500 to-rose-500",
  "from-indigo-500 to-purple-500",
  "from-cyan-500 to-blue-500"
];

export default function AdminCMS() {
  const navigate = useNavigate();
  const [content, setContent] = useState<HomepageContent>(defaultHomepageContent);
  const [editingSection, setEditingSection] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [previewMode, setPreviewMode] = useState<boolean>(false);

  useEffect(() => {
    loadHomepageContent();
  }, []);

  const loadHomepageContent = () => {
    try {
      const savedContent = localStorage.getItem('homepage_content');
      if (savedContent) {
        setContent(JSON.parse(savedContent));
      } else {
        // Initialize with default content
        localStorage.setItem('homepage_content', JSON.stringify(defaultHomepageContent));
      }
    } catch (error) {
      console.error('Error loading homepage content:', error);
      toast({
        title: "Loading Error",
        description: "Failed to load content. Using default values.",
        variant: "destructive",
      });
    }
  };

  const saveHomepageContent = () => {
    try {
      setIsLoading(true);
      localStorage.setItem('homepage_content', JSON.stringify(content));
      
      // Also save to separate backup
      const timestamp = new Date().toISOString();
      localStorage.setItem(`homepage_backup_${timestamp}`, JSON.stringify(content));
      
      toast({
        title: "Content Saved! 🎉",
        description: "All homepage content has been successfully updated.",
      });
    } catch (error) {
      console.error('Error saving homepage content:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportContent = () => {
    try {
      const dataStr = JSON.stringify(content, null, 2);
      const dataBlob = new Blob([dataStr], {type: 'application/json'});
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `homepage-content-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Content Exported! 📄",
        description: "Homepage content has been exported to JSON file.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export content.",
        variant: "destructive",
      });
    }
  };

  const importContent = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedContent = JSON.parse(e.target?.result as string);
        setContent(importedContent);
        toast({
          title: "Content Imported! 📥",
          description: "Homepage content has been imported successfully.",
        });
      } catch (error) {
        toast({
          title: "Import Failed",
          description: "Invalid JSON file format.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  const resetToDefaults = () => {
    setContent(defaultHomepageContent);
    toast({
      title: "Content Reset! 🔄",
      description: "All content has been reset to default values.",
    });
  };

  const addNewItem = (section: string) => {
    const newContent = { ...content };
    
    switch (section) {
      case 'heroFeatures':
        newContent.hero.features.push({
          id: `feature_${Date.now()}`,
          icon: "Star",
          title: "New Feature",
          subtitle: "Description",
          color: "#3b82f6"
        });
        break;
      case 'ctaButtons':
        newContent.hero.ctaButtons.push({
          id: `cta_${Date.now()}`,
          text: "New Button",
          link: "/",
          variant: "outline",
          enabled: true
        });
        break;
      case 'services':
        newContent.services.items.push({
          id: `service_${Date.now()}`,
          icon: "Car",
          title: "New Service",
          description: "Service description",
          gradient: "from-blue-500 to-blue-600",
          enabled: true
        });
        break;
      case 'branches':
        newContent.locations.branches.push({
          id: `branch_${Date.now()}`,
          name: "New Branch",
          location: "Branch Location",
          gradient: "from-fac-orange-500 to-fac-orange-600",
          enabled: true
        });
        break;
    }
    
    setContent(newContent);
  };

  const removeItem = (section: string, id: string) => {
    const newContent = { ...content };
    
    switch (section) {
      case 'heroFeatures':
        newContent.hero.features = newContent.hero.features.filter(item => item.id !== id);
        break;
      case 'ctaButtons':
        newContent.hero.ctaButtons = newContent.hero.ctaButtons.filter(item => item.id !== id);
        break;
      case 'services':
        newContent.services.items = newContent.services.items.filter(item => item.id !== id);
        break;
      case 'branches':
        newContent.locations.branches = newContent.locations.branches.filter(item => item.id !== id);
        break;
    }
    
    setContent(newContent);
  };

  const previewHomepage = () => {
    // Save current content
    localStorage.setItem('homepage_content', JSON.stringify(content));
    
    // Open homepage in new tab
    window.open('/', '_blank');
    
    toast({
      title: "Preview Opened! 👀",
      description: "Homepage preview opened in new tab.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Advanced CMS</h1>
          <p className="text-muted-foreground">Complete homepage content management</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={previewHomepage}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            Preview
          </Button>
          
          <Button
            onClick={exportContent}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          
          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={importContent}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <Button variant="outline" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Import
            </Button>
          </div>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Reset
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset to Defaults</AlertDialogTitle>
                <AlertDialogDescription>
                  This will reset all content to default values. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={resetToDefaults} className="bg-red-600 hover:bg-red-700">
                  Reset All Content
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          <Button
            onClick={saveHomepageContent}
            disabled={isLoading}
            className="bg-fac-orange-500 hover:bg-fac-orange-600 text-white flex items-center gap-2"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save All Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="hero" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="vision">Vision/Mission</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
          <TabsTrigger value="theme">Theme</TabsTrigger>
        </TabsList>

        {/* Hero Section */}
        <TabsContent value="hero" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Hero Content */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Home className="h-5 w-5 mr-2 text-fac-orange-500" />
                  Hero Section Content
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="heroLogo">Logo URL</Label>
                  <Input
                    id="heroLogo"
                    value={content.hero.logo}
                    onChange={(e) => setContent({
                      ...content,
                      hero: { ...content.hero, logo: e.target.value }
                    })}
                    placeholder="Enter logo URL"
                  />
                </div>
                
                <div>
                  <Label htmlFor="heroBadge">Badge Text</Label>
                  <Input
                    id="heroBadge"
                    value={content.hero.badge}
                    onChange={(e) => setContent({
                      ...content,
                      hero: { ...content.hero, badge: e.target.value }
                    })}
                    placeholder="Premium"
                  />
                </div>
                
                <div>
                  <Label htmlFor="heroMainTitle">Main Title</Label>
                  <Input
                    id="heroMainTitle"
                    value={content.hero.mainTitle}
                    onChange={(e) => setContent({
                      ...content,
                      hero: { ...content.hero, mainTitle: e.target.value }
                    })}
                    placeholder="Smart Auto Care"
                  />
                </div>
                
                <div>
                  <Label htmlFor="heroHighlightedTitle">Highlighted Title</Label>
                  <Input
                    id="heroHighlightedTitle"
                    value={content.hero.highlightedTitle}
                    onChange={(e) => setContent({
                      ...content,
                      hero: { ...content.hero, highlightedTitle: e.target.value }
                    })}
                    placeholder="for Modern Drivers"
                  />
                </div>
                
                <div>
                  <Label htmlFor="heroSubtitle">Subtitle</Label>
                  <Input
                    id="heroSubtitle"
                    value={content.hero.subtitle}
                    onChange={(e) => setContent({
                      ...content,
                      hero: { ...content.hero, subtitle: e.target.value }
                    })}
                    placeholder="Premium Quality • Affordable Prices"
                  />
                </div>
                
                <div>
                  <Label htmlFor="heroDescription">Description</Label>
                  <Textarea
                    id="heroDescription"
                    value={content.hero.description}
                    onChange={(e) => setContent({
                      ...content,
                      hero: { ...content.hero, description: e.target.value }
                    })}
                    placeholder="Enter hero description"
                    className="min-h-[80px]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Hero Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Sparkles className="h-5 w-5 mr-2 text-fac-orange-500" />
                    Feature Highlights
                  </span>
                  <Button
                    onClick={() => addNewItem('heroFeatures')}
                    size="sm"
                    className="bg-fac-orange-500 hover:bg-fac-orange-600"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Feature
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {content.hero.features.map((feature, index) => (
                      <Card key={feature.id} className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <Badge variant="outline">Feature {index + 1}</Badge>
                          <Button
                            onClick={() => removeItem('heroFeatures', feature.id)}
                            size="sm"
                            variant="outline"
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <Label>Icon</Label>
                            <Select
                              value={feature.icon}
                              onValueChange={(value) => {
                                const updatedFeatures = content.hero.features.map(f =>
                                  f.id === feature.id ? { ...f, icon: value } : f
                                );
                                setContent({
                                  ...content,
                                  hero: { ...content.hero, features: updatedFeatures }
                                });
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {iconOptions.map(icon => (
                                  <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label>Title</Label>
                            <Input
                              value={feature.title}
                              onChange={(e) => {
                                const updatedFeatures = content.hero.features.map(f =>
                                  f.id === feature.id ? { ...f, title: e.target.value } : f
                                );
                                setContent({
                                  ...content,
                                  hero: { ...content.hero, features: updatedFeatures }
                                });
                              }}
                            />
                          </div>
                          
                          <div>
                            <Label>Subtitle</Label>
                            <Input
                              value={feature.subtitle}
                              onChange={(e) => {
                                const updatedFeatures = content.hero.features.map(f =>
                                  f.id === feature.id ? { ...f, subtitle: e.target.value } : f
                                );
                                setContent({
                                  ...content,
                                  hero: { ...content.hero, features: updatedFeatures }
                                });
                              }}
                            />
                          </div>
                          
                          <div>
                            <Label>Color</Label>
                            <div className="flex items-center gap-2">
                              <Input
                                type="color"
                                value={feature.color}
                                onChange={(e) => {
                                  const updatedFeatures = content.hero.features.map(f =>
                                    f.id === feature.id ? { ...f, color: e.target.value } : f
                                  );
                                  setContent({
                                    ...content,
                                    hero: { ...content.hero, features: updatedFeatures }
                                  });
                                }}
                                className="w-16"
                              />
                              <span className="text-sm text-muted-foreground">{feature.color}</span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* CTA Buttons */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <ExternalLink className="h-5 w-5 mr-2 text-fac-orange-500" />
                  Call-to-Action Buttons
                </span>
                <Button
                  onClick={() => addNewItem('ctaButtons')}
                  size="sm"
                  className="bg-fac-orange-500 hover:bg-fac-orange-600"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Button
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {content.hero.ctaButtons.map((button, index) => (
                  <Card key={button.id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline">Button {index + 1}</Badge>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={button.enabled}
                          onCheckedChange={(checked) => {
                            const updatedButtons = content.hero.ctaButtons.map(b =>
                              b.id === button.id ? { ...b, enabled: checked } : b
                            );
                            setContent({
                              ...content,
                              hero: { ...content.hero, ctaButtons: updatedButtons }
                            });
                          }}
                        />
                        <Button
                          onClick={() => removeItem('ctaButtons', button.id)}
                          size="sm"
                          variant="outline"
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <Label>Button Text</Label>
                        <Input
                          value={button.text}
                          onChange={(e) => {
                            const updatedButtons = content.hero.ctaButtons.map(b =>
                              b.id === button.id ? { ...b, text: e.target.value } : b
                            );
                            setContent({
                              ...content,
                              hero: { ...content.hero, ctaButtons: updatedButtons }
                            });
                          }}
                        />
                      </div>
                      
                      <div>
                        <Label>Link</Label>
                        <Input
                          value={button.link}
                          onChange={(e) => {
                            const updatedButtons = content.hero.ctaButtons.map(b =>
                              b.id === button.id ? { ...b, link: e.target.value } : b
                            );
                            setContent({
                              ...content,
                              hero: { ...content.hero, ctaButtons: updatedButtons }
                            });
                          }}
                        />
                      </div>
                      
                      <div>
                        <Label>Variant</Label>
                        <Select
                          value={button.variant}
                          onValueChange={(value: 'primary' | 'secondary' | 'outline') => {
                            const updatedButtons = content.hero.ctaButtons.map(b =>
                              b.id === button.id ? { ...b, variant: value } : b
                            );
                            setContent({
                              ...content,
                              hero: { ...content.hero, ctaButtons: updatedButtons }
                            });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="primary">Primary</SelectItem>
                            <SelectItem value="secondary">Secondary</SelectItem>
                            <SelectItem value="outline">Outline</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Services Section */}
        <TabsContent value="services" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Services Header */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Car className="h-5 w-5 mr-2 text-fac-orange-500" />
                  Services Section Header
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="servicesBadge">Badge Text</Label>
                  <Input
                    id="servicesBadge"
                    value={content.services.badge}
                    onChange={(e) => setContent({
                      ...content,
                      services: { ...content.services, badge: e.target.value }
                    })}
                    placeholder="Our Services"
                  />
                </div>
                
                <div>
                  <Label htmlFor="servicesTitle">Section Title</Label>
                  <Input
                    id="servicesTitle"
                    value={content.services.title}
                    onChange={(e) => setContent({
                      ...content,
                      services: { ...content.services, title: e.target.value }
                    })}
                    placeholder="Premium Auto Care"
                  />
                </div>
                
                <div>
                  <Label htmlFor="servicesHighlightedTitle">Highlighted Title</Label>
                  <Input
                    id="servicesHighlightedTitle"
                    value={content.services.highlightedTitle}
                    onChange={(e) => setContent({
                      ...content,
                      services: { ...content.services, highlightedTitle: e.target.value }
                    })}
                    placeholder="(Optional highlighted part)"
                  />
                </div>
                
                <div>
                  <Label htmlFor="servicesDescription">Description</Label>
                  <Textarea
                    id="servicesDescription"
                    value={content.services.description}
                    onChange={(e) => setContent({
                      ...content,
                      services: { ...content.services, description: e.target.value }
                    })}
                    placeholder="Section description"
                    className="min-h-[80px]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Services Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Settings className="h-5 w-5 mr-2 text-fac-orange-500" />
                    Service Items
                  </span>
                  <Button
                    onClick={() => addNewItem('services')}
                    size="sm"
                    className="bg-fac-orange-500 hover:bg-fac-orange-600"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Service
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {content.services.items.map((service, index) => (
                      <Card key={service.id} className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <Badge variant="outline">Service {index + 1}</Badge>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={service.enabled}
                              onCheckedChange={(checked) => {
                                const updatedServices = content.services.items.map(s =>
                                  s.id === service.id ? { ...s, enabled: checked } : s
                                );
                                setContent({
                                  ...content,
                                  services: { ...content.services, items: updatedServices }
                                });
                              }}
                            />
                            <Button
                              onClick={() => removeItem('services', service.id)}
                              size="sm"
                              variant="outline"
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <Label>Icon</Label>
                            <Select
                              value={service.icon}
                              onValueChange={(value) => {
                                const updatedServices = content.services.items.map(s =>
                                  s.id === service.id ? { ...s, icon: value } : s
                                );
                                setContent({
                                  ...content,
                                  services: { ...content.services, items: updatedServices }
                                });
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {iconOptions.map(icon => (
                                  <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label>Service Title</Label>
                            <Input
                              value={service.title}
                              onChange={(e) => {
                                const updatedServices = content.services.items.map(s =>
                                  s.id === service.id ? { ...s, title: e.target.value } : s
                                );
                                setContent({
                                  ...content,
                                  services: { ...content.services, items: updatedServices }
                                });
                              }}
                            />
                          </div>
                          
                          <div>
                            <Label>Description</Label>
                            <Textarea
                              value={service.description}
                              onChange={(e) => {
                                const updatedServices = content.services.items.map(s =>
                                  s.id === service.id ? { ...s, description: e.target.value } : s
                                );
                                setContent({
                                  ...content,
                                  services: { ...content.services, items: updatedServices }
                                });
                              }}
                              className="min-h-[60px]"
                            />
                          </div>
                          
                          <div>
                            <Label>Gradient</Label>
                            <Select
                              value={service.gradient}
                              onValueChange={(value) => {
                                const updatedServices = content.services.items.map(s =>
                                  s.id === service.id ? { ...s, gradient: value } : s
                                );
                                setContent({
                                  ...content,
                                  services: { ...content.services, items: updatedServices }
                                });
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {gradientOptions.map(gradient => (
                                  <SelectItem key={gradient} value={gradient}>
                                    <div className="flex items-center gap-2">
                                      <div className={`w-4 h-4 rounded bg-gradient-to-r ${gradient}`}></div>
                                      {gradient.replace('from-', '').replace('to-', ' → ')}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Vision/Mission Section */}
        <TabsContent value="vision" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Section Header */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Crown className="h-5 w-5 mr-2 text-fac-orange-500" />
                  Vision & Mission Header
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="vmBadge">Badge Text</Label>
                  <Input
                    id="vmBadge"
                    value={content.visionMission.badge}
                    onChange={(e) => setContent({
                      ...content,
                      visionMission: { ...content.visionMission, badge: e.target.value }
                    })}
                    placeholder="About Us"
                  />
                </div>
                
                <div>
                  <Label htmlFor="vmTitle">Section Title</Label>
                  <Input
                    id="vmTitle"
                    value={content.visionMission.title}
                    onChange={(e) => setContent({
                      ...content,
                      visionMission: { ...content.visionMission, title: e.target.value }
                    })}
                    placeholder="Our Story"
                  />
                </div>
                
                <div>
                  <Label htmlFor="vmHighlightedTitle">Highlighted Title</Label>
                  <Input
                    id="vmHighlightedTitle"
                    value={content.visionMission.highlightedTitle}
                    onChange={(e) => setContent({
                      ...content,
                      visionMission: { ...content.visionMission, highlightedTitle: e.target.value }
                    })}
                    placeholder="(Optional highlighted part)"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Vision & Mission Content */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="h-5 w-5 mr-2 text-fac-orange-500" />
                  Vision & Mission Content
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Vision */}
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-3 flex items-center">
                    <Crown className="h-4 w-4 mr-2" />
                    Vision
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={content.visionMission.vision.title}
                        onChange={(e) => setContent({
                          ...content,
                          visionMission: {
                            ...content.visionMission,
                            vision: { ...content.visionMission.vision, title: e.target.value }
                          }
                        })}
                        placeholder="Our Vision"
                      />
                    </div>
                    
                    <div>
                      <Label>Content</Label>
                      <Textarea
                        value={content.visionMission.vision.content}
                        onChange={(e) => setContent({
                          ...content,
                          visionMission: {
                            ...content.visionMission,
                            vision: { ...content.visionMission.vision, content: e.target.value }
                          }
                        })}
                        className="min-h-[80px]"
                        placeholder="Vision statement"
                      />
                    </div>
                    
                    <div>
                      <Label>Icon</Label>
                      <Select
                        value={content.visionMission.vision.icon}
                        onValueChange={(value) => setContent({
                          ...content,
                          visionMission: {
                            ...content.visionMission,
                            vision: { ...content.visionMission.vision, icon: value }
                          }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {iconOptions.map(icon => (
                            <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Mission */}
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-3 flex items-center">
                    <Star className="h-4 w-4 mr-2" />
                    Mission
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={content.visionMission.mission.title}
                        onChange={(e) => setContent({
                          ...content,
                          visionMission: {
                            ...content.visionMission,
                            mission: { ...content.visionMission.mission, title: e.target.value }
                          }
                        })}
                        placeholder="Our Mission"
                      />
                    </div>
                    
                    <div>
                      <Label>Content</Label>
                      <Textarea
                        value={content.visionMission.mission.content}
                        onChange={(e) => setContent({
                          ...content,
                          visionMission: {
                            ...content.visionMission,
                            mission: { ...content.visionMission.mission, content: e.target.value }
                          }
                        })}
                        className="min-h-[80px]"
                        placeholder="Mission statement"
                      />
                    </div>
                    
                    <div>
                      <Label>Icon</Label>
                      <Select
                        value={content.visionMission.mission.icon}
                        onValueChange={(value) => setContent({
                          ...content,
                          visionMission: {
                            ...content.visionMission,
                            mission: { ...content.visionMission.mission, icon: value }
                          }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {iconOptions.map(icon => (
                            <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Locations Section */}
        <TabsContent value="locations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Locations Header */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-fac-orange-500" />
                  Locations Section Header
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="locationsBadge">Badge Text</Label>
                  <Input
                    id="locationsBadge"
                    value={content.locations.badge}
                    onChange={(e) => setContent({
                      ...content,
                      locations: { ...content.locations, badge: e.target.value }
                    })}
                    placeholder="Locations"
                  />
                </div>
                
                <div>
                  <Label htmlFor="locationsTitle">Section Title</Label>
                  <Input
                    id="locationsTitle"
                    value={content.locations.title}
                    onChange={(e) => setContent({
                      ...content,
                      locations: { ...content.locations, title: e.target.value }
                    })}
                    placeholder="Visit Our Branches"
                  />
                </div>
                
                <div>
                  <Label htmlFor="locationsHighlightedTitle">Highlighted Title</Label>
                  <Input
                    id="locationsHighlightedTitle"
                    value={content.locations.highlightedTitle}
                    onChange={(e) => setContent({
                      ...content,
                      locations: { ...content.locations, highlightedTitle: e.target.value }
                    })}
                    placeholder="(Optional highlighted part)"
                  />
                </div>
                
                <div>
                  <Label htmlFor="locationsDescription">Description</Label>
                  <Textarea
                    id="locationsDescription"
                    value={content.locations.description}
                    onChange={(e) => setContent({
                      ...content,
                      locations: { ...content.locations, description: e.target.value }
                    })}
                    placeholder="Section description"
                    className="min-h-[80px]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Branch Locations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-fac-orange-500" />
                    Branch Locations
                  </span>
                  <Button
                    onClick={() => addNewItem('branches')}
                    size="sm"
                    className="bg-fac-orange-500 hover:bg-fac-orange-600"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Branch
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {content.locations.branches.map((branch, index) => (
                    <Card key={branch.id} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="outline">Branch {index + 1}</Badge>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={branch.enabled}
                            onCheckedChange={(checked) => {
                              const updatedBranches = content.locations.branches.map(b =>
                                b.id === branch.id ? { ...b, enabled: checked } : b
                              );
                              setContent({
                                ...content,
                                locations: { ...content.locations, branches: updatedBranches }
                              });
                            }}
                          />
                          <Button
                            onClick={() => removeItem('branches', branch.id)}
                            size="sm"
                            variant="outline"
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <Label>Branch Name</Label>
                          <Input
                            value={branch.name}
                            onChange={(e) => {
                              const updatedBranches = content.locations.branches.map(b =>
                                b.id === branch.id ? { ...b, name: e.target.value } : b
                              );
                              setContent({
                                ...content,
                                locations: { ...content.locations, branches: updatedBranches }
                              });
                            }}
                            placeholder="Branch Name"
                          />
                        </div>
                        
                        <div>
                          <Label>Location</Label>
                          <Input
                            value={branch.location}
                            onChange={(e) => {
                              const updatedBranches = content.locations.branches.map(b =>
                                b.id === branch.id ? { ...b, location: e.target.value } : b
                              );
                              setContent({
                                ...content,
                                locations: { ...content.locations, branches: updatedBranches }
                              });
                            }}
                            placeholder="Branch location/address"
                          />
                        </div>
                        
                        <div>
                          <Label>Gradient</Label>
                          <Select
                            value={branch.gradient}
                            onValueChange={(value) => {
                              const updatedBranches = content.locations.branches.map(b =>
                                b.id === branch.id ? { ...b, gradient: value } : b
                              );
                              setContent({
                                ...content,
                                locations: { ...content.locations, branches: updatedBranches }
                              });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {gradientOptions.map(gradient => (
                                <SelectItem key={gradient} value={gradient}>
                                  <div className="flex items-center gap-2">
                                    <div className={`w-4 h-4 rounded bg-gradient-to-r ${gradient}`}></div>
                                    {gradient.replace('from-', '').replace('to-', ' → ')}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Footer Section */}
        <TabsContent value="footer" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-fac-orange-500" />
                Footer Content
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="footerCompanyName">Company Name</Label>
                <Input
                  id="footerCompanyName"
                  value={content.footer.companyName}
                  onChange={(e) => setContent({
                    ...content,
                    footer: { ...content.footer, companyName: e.target.value }
                  })}
                  placeholder="Fayeed Auto Care"
                />
              </div>
              
              <div>
                <Label htmlFor="footerTagline">Tagline</Label>
                <Input
                  id="footerTagline"
                  value={content.footer.tagline}
                  onChange={(e) => setContent({
                    ...content,
                    footer: { ...content.footer, tagline: e.target.value }
                  })}
                  placeholder="Zamboanga's First Smart Carwash & Auto Detailing Service"
                />
              </div>
              
              <div>
                <Label htmlFor="footerPoweredBy">Powered By</Label>
                <Input
                  id="footerPoweredBy"
                  value={content.footer.poweredBy}
                  onChange={(e) => setContent({
                    ...content,
                    footer: { ...content.footer, poweredBy: e.target.value }
                  })}
                  placeholder="Fdigitals"
                />
              </div>
              
              <div>
                <Label htmlFor="footerCopyright">Copyright Text</Label>
                <Input
                  id="footerCopyright"
                  value={content.footer.copyright}
                  onChange={(e) => setContent({
                    ...content,
                    footer: { ...content.footer, copyright: e.target.value }
                  })}
                  placeholder="© 2025 Fayeed Auto Care"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Theme Section */}
        <TabsContent value="theme" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="h-5 w-5 mr-2 text-fac-orange-500" />
                Brand Colors & Theme
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="themePrimaryColor">Primary Color</Label>
                  <div className="flex items-center gap-3 mt-2">
                    <Input
                      type="color"
                      id="themePrimaryColor"
                      value={content.theme.primaryColor}
                      onChange={(e) => setContent({
                        ...content,
                        theme: { ...content.theme, primaryColor: e.target.value }
                      })}
                      className="w-16 h-10"
                    />
                    <div className="flex-1">
                      <Input
                        value={content.theme.primaryColor}
                        onChange={(e) => setContent({
                          ...content,
                          theme: { ...content.theme, primaryColor: e.target.value }
                        })}
                        placeholder="#ff6b1f"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Main brand color (Orange)</p>
                </div>
                
                <div>
                  <Label htmlFor="themeSecondaryColor">Secondary Color</Label>
                  <div className="flex items-center gap-3 mt-2">
                    <Input
                      type="color"
                      id="themeSecondaryColor"
                      value={content.theme.secondaryColor}
                      onChange={(e) => setContent({
                        ...content,
                        theme: { ...content.theme, secondaryColor: e.target.value }
                      })}
                      className="w-16 h-10"
                    />
                    <div className="flex-1">
                      <Input
                        value={content.theme.secondaryColor}
                        onChange={(e) => setContent({
                          ...content,
                          theme: { ...content.theme, secondaryColor: e.target.value }
                        })}
                        placeholder="#8b5cf6"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Secondary brand color (Purple)</p>
                </div>
                
                <div>
                  <Label htmlFor="themeAccentColor">Accent Color</Label>
                  <div className="flex items-center gap-3 mt-2">
                    <Input
                      type="color"
                      id="themeAccentColor"
                      value={content.theme.accentColor}
                      onChange={(e) => setContent({
                        ...content,
                        theme: { ...content.theme, accentColor: e.target.value }
                      })}
                      className="w-16 h-10"
                    />
                    <div className="flex-1">
                      <Input
                        value={content.theme.accentColor}
                        onChange={(e) => setContent({
                          ...content,
                          theme: { ...content.theme, accentColor: e.target.value }
                        })}
                        placeholder="#3b82f6"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Accent color (Blue)</p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-semibold mb-3">Color Preview</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div 
                      className="w-full h-16 rounded-lg mb-2"
                      style={{ backgroundColor: content.theme.primaryColor }}
                    ></div>
                    <p className="text-sm font-medium">Primary</p>
                    <p className="text-xs text-muted-foreground">{content.theme.primaryColor}</p>
                  </div>
                  <div className="text-center">
                    <div 
                      className="w-full h-16 rounded-lg mb-2"
                      style={{ backgroundColor: content.theme.secondaryColor }}
                    ></div>
                    <p className="text-sm font-medium">Secondary</p>
                    <p className="text-xs text-muted-foreground">{content.theme.secondaryColor}</p>
                  </div>
                  <div className="text-center">
                    <div 
                      className="w-full h-16 rounded-lg mb-2"
                      style={{ backgroundColor: content.theme.accentColor }}
                    ></div>
                    <p className="text-sm font-medium">Accent</p>
                    <p className="text-xs text-muted-foreground">{content.theme.accentColor}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
