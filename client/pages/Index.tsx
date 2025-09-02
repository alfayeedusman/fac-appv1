import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import StickyHeader from "@/components/StickyHeader";
import {
  Car,
  Droplets,
  Star,
  MapPin,
  ArrowRight,
  Shield,
  Crown,
  Sparkles,
  Zap,
  Smartphone,
  CheckCircle,
  Phone,
  Clock,
  Calendar,
  Settings,
  Gift,
} from "lucide-react";

// Icon mapping for dynamic rendering
const iconMap: { [key: string]: any } = {
  Car,
  Droplets,
  Star,
  MapPin,
  Shield,
  Crown,
  Sparkles,
  Zap,
  Smartphone,
  CheckCircle,
  Phone,
  Clock,
  Calendar,
  Settings,
  Gift,
};

// Homepage content interface
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

// Default content fallback
const defaultContent: HomepageContent = {
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

export default function Index() {
  const navigate = useNavigate();
  const [content, setContent] = useState<HomepageContent>(defaultContent);

  useEffect(() => {
    // Check if user is already authenticated
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (isAuthenticated === "true") {
      const hasSeenWelcome = localStorage.getItem("hasSeenWelcome");
      const userRole = localStorage.getItem("userRole");

      // Always route admin and superadmin users directly to admin dashboard
      if (userRole === "admin" || userRole === "superadmin") {
        navigate("/admin-dashboard");
        return;
      }

      if (hasSeenWelcome === "true") {
        // Route based on user role
        if (userRole === "manager") {
          navigate("/manager-dashboard");
        } else if (userRole === "crew") {
          navigate("/crew-dashboard");
        } else if (userRole === "cashier") {
          navigate("/pos");
        } else if (userRole === "inventory_manager") {
          navigate("/inventory-management");
        } else {
          navigate("/dashboard");
        }
      } else {
        navigate("/welcome");
      }
    } else {
      // Check if this is the superadmin trying to access directly
      const userEmail = localStorage.getItem("userEmail");
      if (userEmail === "fffayeed@gmail.com") {
        // Auto-authenticate superadmin
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userRole", "superadmin");
        localStorage.setItem("hasSeenWelcome", "true");
        localStorage.setItem(`welcomed_${userEmail}`, "true");
        navigate("/admin-dashboard");
        return;
      }
    }

    // Load CMS content
    loadCMSContent();
  }, [navigate]);

  const loadCMSContent = () => {
    try {
      const savedContent = localStorage.getItem('homepage_content');
      if (savedContent) {
        const parsedContent = JSON.parse(savedContent);
        setContent(parsedContent);
      } else {
        // Initialize with default content
        localStorage.setItem('homepage_content', JSON.stringify(defaultContent));
      }
    } catch (error) {
      console.error('Error loading CMS content:', error);
      // Use default content on error
      setContent(defaultContent);
    }
  };

  // Helper function to render icons dynamically
  const renderIcon = (iconName: string, className: string = "h-6 w-6") => {
    const IconComponent = iconMap[iconName];
    return IconComponent ? <IconComponent className={className} /> : <Star className={className} />;
  };

  // Helper function to get button variant styles
  const getButtonVariantClass = (variant: string) => {
    switch (variant) {
      case 'primary':
        return "w-full py-4 text-base font-bold rounded-xl shadow-lg bg-gradient-to-r from-fac-orange-500 to-fac-orange-600 hover:from-fac-orange-600 hover:to-fac-orange-700 text-white border-0 hover-lift group transition-all duration-300";
      case 'secondary':
        return "w-full py-3 text-sm font-bold rounded-xl border-2 hover:bg-secondary hover:border-secondary-foreground transition-all duration-300";
      case 'outline':
      default:
        return "w-full py-3 text-sm font-bold rounded-xl border-2 hover:bg-fac-orange-50 hover:border-fac-orange-200 dark:hover:bg-fac-orange-950 transition-all duration-300";
    }
  };

  return (
    <div className="min-h-screen bg-background theme-transition relative overflow-hidden">
      <StickyHeader showBack={false} title={content.footer.companyName} />

      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-gradient-to-r from-fac-orange-500/8 to-purple-500/8 blur-xl animate-float"></div>
        <div className="absolute top-40 right-20 w-24 h-24 rounded-full bg-gradient-to-r from-blue-500/8 to-fac-orange-500/8 blur-xl animate-float animate-delay-200"></div>
        <div className="absolute bottom-40 left-1/4 w-40 h-40 rounded-full bg-gradient-to-r from-purple-500/5 to-pink-500/5 blur-2xl animate-breathe"></div>
        <div className="absolute top-1/2 right-10 w-20 h-20 rounded-full bg-gradient-to-r from-green-500/6 to-blue-500/6 blur-lg animate-float animate-delay-500"></div>
      </div>

      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <div className="glass rounded-full p-1 animate-fade-in-scale">
          <ThemeToggle />
        </div>
      </div>

      {/* Hero Section - Enhanced */}
      <div className="relative z-10 px-6 py-12 text-center max-w-md mx-auto">
        {/* Logo with Better Spacing */}
        <div className="mb-10 animate-fade-in-up">
          <div className="inline-block relative">
            <img
              src={content.hero.logo}
              alt={`${content.footer.companyName} Logo`}
              className="h-20 w-auto mx-auto drop-shadow-lg"
            />
            {content.hero.badge && (
              <div className="absolute -top-2 -right-2">
                <Badge className="bg-fac-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                  {content.hero.badge}
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Typography */}
        <div className="space-y-6 mb-14">
          <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight leading-tight animate-fade-in-up animate-delay-100">
            <span className="block mb-2">
              <span className="bg-gradient-to-r from-fac-orange-500 to-purple-600 bg-clip-text text-transparent">
                {content.hero.mainTitle}
              </span>
              {content.hero.highlightedTitle && (
                <>
                  {" "}
                  <span className="text-2xl md:text-3xl font-bold text-muted-foreground">
                    {content.hero.highlightedTitle}
                  </span>
                </>
              )}
            </span>
          </h1>
          
          {content.hero.subtitle && (
            <div className="flex items-center justify-center gap-2 animate-fade-in-up animate-delay-200">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <p className="text-lg text-muted-foreground font-medium">
                {content.hero.subtitle}
              </p>
            </div>
          )}
          
          {content.hero.description && (
            <p className="text-base text-muted-foreground animate-fade-in-up animate-delay-300 max-w-sm mx-auto leading-relaxed">
              {content.hero.description}
            </p>
          )}
        </div>

        {/* Enhanced Feature Highlights */}
        {content.hero.features.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-12 animate-fade-in-up animate-delay-400">
            {content.hero.features.map((feature, index) => (
              <div key={feature.id} className="text-center group">
                <div className="glass w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-3 hover-lift group-hover:scale-105 transition-all duration-300">
                  <div style={{ color: feature.color }}>
                    {renderIcon(feature.icon, "h-6 w-6")}
                  </div>
                </div>
                <p className="text-xs font-bold text-foreground mb-1">{feature.title}</p>
                <p className="text-xs text-muted-foreground">{feature.subtitle}</p>
              </div>
            ))}
          </div>
        )}

        {/* Enhanced CTA Buttons */}
        <div className="space-y-4 max-w-sm mx-auto">
          {content.hero.ctaButtons
            .filter(button => button.enabled)
            .map((button, index) => (
              <Link
                key={button.id}
                to={button.link}
                className={`block animate-fade-in-up animate-delay-${500 + (index * 100)}`}
              >
                <Button className={getButtonVariantClass(button.variant)}>
                  <span className="flex items-center justify-center">
                    {button.variant === 'primary' && <CheckCircle className="h-5 w-5 mr-2" />}
                    {button.text}
                    {button.variant === 'primary' && <Zap className="h-5 w-5 ml-2 group-hover:scale-110 transition-transform duration-300" />}
                    {button.variant === 'outline' && <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>}
                  </span>
                </Button>
              </Link>
            ))}

          {content.hero.ctaButtons.filter(button => button.enabled).length > 1 && (
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-border"></div>
              <span className="text-xs text-muted-foreground font-medium px-3">or</span>
              <div className="flex-1 h-px bg-border"></div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Services Section */}
      <div className="px-6 py-16 relative z-10">
        <div className="text-center mb-12">
          {content.services.badge && (
            <Badge className="mb-4 bg-fac-orange-100 text-fac-orange-700 dark:bg-fac-orange-900 dark:text-fac-orange-200">
              {content.services.badge}
            </Badge>
          )}
          <h2 className="text-3xl font-black text-foreground animate-fade-in-up">
            {content.services.title}{" "}
            {content.services.highlightedTitle && (
              <span className="bg-gradient-to-r from-fac-orange-500 to-purple-600 bg-clip-text text-transparent">
                {content.services.highlightedTitle}
              </span>
            )}
          </h2>
          {content.services.description && (
            <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
              {content.services.description}
            </p>
          )}
        </div>

        <div className="space-y-4 max-w-md mx-auto">
          {content.services.items
            .filter(service => service.enabled)
            .map((service, index) => (
              <Card key={service.id} className={`glass border-border/50 shadow-md hover:shadow-xl hover-lift animate-fade-in-up animate-delay-${100 + (index * 100)} group transition-all duration-300`}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-r ${service.gradient} flex-shrink-0`}>
                      {renderIcon(service.icon, "h-6 w-6 text-white")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-foreground text-base mb-2 group-hover:text-fac-orange-600 transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {service.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>

      {/* Enhanced Vision & Mission */}
      <div className="px-6 py-16 bg-gradient-to-b from-muted/30 to-muted/10 relative">
        <div className="relative z-10 max-w-md mx-auto">
          <div className="text-center mb-12">
            {content.visionMission.badge && (
              <Badge className="mb-4 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200">
                {content.visionMission.badge}
              </Badge>
            )}
            <h2 className="text-3xl font-black text-foreground animate-fade-in-up">
              {content.visionMission.title}{" "}
              {content.visionMission.highlightedTitle && (
                <span className="bg-gradient-to-r from-fac-orange-500 to-purple-600 bg-clip-text text-transparent">
                  {content.visionMission.highlightedTitle}
                </span>
              )}
            </h2>
          </div>

          <div className="space-y-6">
            <Card className="glass border-border/50 shadow-md hover-lift animate-fade-in-up animate-delay-100">
              <CardContent className="p-8 text-center">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${content.visionMission.vision.gradient} flex items-center justify-center mx-auto mb-6`}>
                  {renderIcon(content.visionMission.vision.icon, "h-8 w-8 text-white")}
                </div>
                <h3 className="font-black text-foreground text-lg mb-4">{content.visionMission.vision.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {content.visionMission.vision.content}
                </p>
              </CardContent>
            </Card>

            <Card className="glass border-border/50 shadow-md hover-lift animate-fade-in-up animate-delay-200">
              <CardContent className="p-8 text-center">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${content.visionMission.mission.gradient} flex items-center justify-center mx-auto mb-6`}>
                  {renderIcon(content.visionMission.mission.icon, "h-8 w-8 text-white")}
                </div>
                <h3 className="font-black text-foreground text-lg mb-4">{content.visionMission.mission.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {content.visionMission.mission.content}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Enhanced Locations */}
      <div className="px-6 py-16 relative">
        <div className="relative z-10">
          <div className="text-center mb-12">
            {content.locations.badge && (
              <Badge className="mb-4 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                {content.locations.badge}
              </Badge>
            )}
            <h2 className="text-3xl font-black text-foreground animate-fade-in-up">
              {content.locations.title}{" "}
              {content.locations.highlightedTitle && (
                <span className="bg-gradient-to-r from-fac-orange-500 to-purple-600 bg-clip-text text-transparent">
                  {content.locations.highlightedTitle}
                </span>
              )}
            </h2>
            {content.locations.description && (
              <p className="text-muted-foreground mt-2">{content.locations.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
            {content.locations.branches
              .filter(branch => branch.enabled)
              .map((branch, index) => (
                <Card key={branch.id} className={`glass border-border/50 shadow-md hover-lift animate-fade-in-up animate-delay-${100 + (index * 100)} group`}>
                  <CardContent className="p-6 text-center">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${branch.gradient} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                      <MapPin className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="font-bold text-foreground text-base mb-2">{branch.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{branch.location}</p>
                    <Button size="sm" variant="ghost" className="text-xs">
                      <Phone className="h-3 w-3 mr-1" />
                      Contact
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </div>

      {/* Enhanced Footer */}
      <div className="px-6 py-12 bg-gradient-to-t from-muted/20 to-transparent relative z-10">
        <div className="glass rounded-2xl p-8 max-w-sm mx-auto text-center animate-fade-in-up">
          <div className="mb-4">
            {content.footer.companyName && (
              <>
                <Badge className="bg-fac-orange-100 text-fac-orange-700 dark:bg-fac-orange-900 dark:text-fac-orange-200 mb-2">
                  Est. 2025
                </Badge>
                <h3 className="font-bold text-foreground mb-2">{content.footer.companyName}</h3>
              </>
            )}
            {content.footer.tagline && (
              <p className="text-sm text-muted-foreground mb-4">
                {content.footer.tagline}
              </p>
            )}
          </div>
          
          <div className="border-t border-border/50 pt-4">
            <p className="text-xs text-muted-foreground">
              {content.footer.copyright}
            </p>
            {content.footer.poweredBy && (
              <p className="text-xs text-muted-foreground mt-1">
                Powered by{" "}
                <span className="font-medium text-fac-orange-600">{content.footer.poweredBy}</span>
                <span className="inline-block ml-1 animate-pulse">🧡</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
