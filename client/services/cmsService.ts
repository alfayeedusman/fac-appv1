// CMS Service for API communication
const API_BASE_URL = '/api/cms';

export interface HomepageContent {
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
      variant: "primary" | "secondary" | "outline";
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

export interface CMSApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  metadata?: {
    id: string;
    version: string;
    lastUpdated: string;
    publishedAt: string;
  };
}

export interface ContentHistory {
  id: string;
  contentId: string;
  action: string;
  changeDescription: string;
  changedBy: string;
  changedByName: string;
  createdAt: string;
}

class CMSService {
  /**
   * Get current homepage content
   */
  async getHomepageContent(): Promise<HomepageContent> {
    const ac = new AbortController();
    const timeout = setTimeout(() => ac.abort(), 8000);

    try {
      const response = await fetch(`${API_BASE_URL}/homepage`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: ac.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: CMSApiResponse<HomepageContent> = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to get homepage content');
      }

      return result.data;
    } catch (error: any) {
      clearTimeout(timeout);

      if (error?.name === 'AbortError') {
        console.warn('⏱️ CMS content request timed out, using default content');
      } else {
        console.error('Error getting homepage content:', error);
      }

      // Return default content as fallback
      return this.getDefaultContent();
    }
  }

  /**
   * Save homepage content
   */
  async saveHomepageContent(content: HomepageContent, userId?: string, userName?: string): Promise<boolean> {
    const ac = new AbortController();
    const timeout = setTimeout(() => ac.abort(), 10000);

    try {
      const response = await fetch(`${API_BASE_URL}/homepage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          userId: userId || 'admin',
          userName: userName || 'Admin User',
        }),
        signal: ac.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to save homepage content');
      }

      return true;
    } catch (error: any) {
      clearTimeout(timeout);

      if (error?.name === 'AbortError') {
        console.error('⏱️ CMS save request timed out');
        throw new Error('Request timed out. Please try again.');
      }

      console.error('Error saving homepage content:', error);
      throw error;
    }
  }

  /**
   * Get content history
   */
  async getContentHistory(limit = 20, offset = 0): Promise<ContentHistory[]> {
    const ac = new AbortController();
    const timeout = setTimeout(() => ac.abort(), 8000);

    try {
      const response = await fetch(`${API_BASE_URL}/history?limit=${limit}&offset=${offset}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: ac.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: CMSApiResponse<ContentHistory[]> = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to get content history');
      }

      return result.data;
    } catch (error: any) {
      clearTimeout(timeout);

      if (error?.name === 'AbortError') {
        console.warn('⏱️ CMS history request timed out');
      } else {
        console.error('Error getting content history:', error);
      }
      return [];
    }
  }

  /**
   * Initialize CMS with default content
   */
  async initializeContent(userId?: string, userName?: string): Promise<boolean> {
    const ac = new AbortController();
    const timeout = setTimeout(() => ac.abort(), 10000);

    try {
      const response = await fetch(`${API_BASE_URL}/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId || 'admin',
          userName: userName || 'Admin User',
        }),
        signal: ac.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to initialize content');
      }

      return true;
    } catch (error: any) {
      clearTimeout(timeout);

      if (error?.name === 'AbortError') {
        console.error('⏱️ CMS initialize request timed out');
        throw new Error('Request timed out. Please try again.');
      }

      console.error('Error initializing content:', error);
      throw error;
    }
  }

  /**
   * Get default content structure
   */
  private getDefaultContent(): HomepageContent {
    return {
      hero: {
        logo: "https://cdn.builder.io/api/v1/image/assets%2Ff7cf3f8f1c944fbfa1f5031abc56523f%2Faa4bc2d15e574dab80ef472ac32b06f9?format=webp&width=800",
        badge: "Premium",
        mainTitle: "Smart Auto Care",
        highlightedTitle: "for Modern Drivers",
        subtitle: "Premium Quality • Affordable Prices",
        description: "Experience the future of car care with our advanced technology and expert service in Zamboanga City",
        features: [
          {
            id: "feature1",
            icon: "Droplets",
            title: "Premium",
            subtitle: "Car Wash",
            color: "#ff6b1f",
          },
          {
            id: "feature2",
            icon: "Clock",
            title: "Quick",
            subtitle: "Service",
            color: "#8b5cf6",
          },
          {
            id: "feature3",
            icon: "Smartphone",
            title: "Smart",
            subtitle: "Booking",
            color: "#3b82f6",
          },
        ],
        ctaButtons: [
          {
            id: "cta1",
            text: "Get Started Free",
            link: "/signup",
            variant: "primary",
            enabled: true,
          },
          {
            id: "cta2",
            text: "Login",
            link: "/login",
            variant: "outline",
            enabled: true,
          },
          {
            id: "cta3",
            text: "Book Now",
            link: "/guest-booking",
            variant: "outline",
            enabled: true,
          },
        ],
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
            enabled: true,
          },
          {
            id: "service2",
            icon: "Star",
            title: "Auto Detailing",
            description: "Comprehensive interior and exterior detailing services",
            gradient: "from-purple-500 to-purple-600",
            enabled: true,
          },
          {
            id: "service3",
            icon: "Sparkles",
            title: "Headlight Restoration",
            description: "Crystal clear headlights for enhanced visibility and safety",
            gradient: "from-blue-500 to-blue-600",
            enabled: true,
          },
          {
            id: "service4",
            icon: "Shield",
            title: "Graphene Coating",
            description: "Advanced protection with long-lasting durability",
            gradient: "from-yellow-500 to-orange-500",
            enabled: true,
          },
        ],
      },
      visionMission: {
        badge: "About Us",
        title: "Our Story",
        highlightedTitle: "",
        vision: {
          title: "Our Vision",
          content: "To become Zamboanga's most trusted auto care brand, delivering premium quality services at affordable prices for every car owner.",
          icon: "Crown",
          gradient: "from-fac-orange-500 to-fac-orange-600",
        },
        mission: {
          title: "Our Mission",
          content: "Committed to excellence in auto detailing and protection, treating every vehicle with care while exceeding customer expectations.",
          icon: "Star",
          gradient: "from-purple-500 to-purple-600",
        },
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
            enabled: true,
          },
          {
            id: "branch2",
            name: "Boalan Branch",
            location: "Besides Divisoria Checkpoint",
            gradient: "from-purple-500 to-purple-600",
            enabled: true,
          },
        ],
      },
      footer: {
        companyName: "Fayeed Auto Care",
        tagline: "Zamboanga's First Smart Carwash & Auto Detailing Service",
        poweredBy: "Fdigitals",
        copyright: "© 2025 Fayeed Auto Care",
      },
      theme: {
        primaryColor: "#ff6b1f",
        secondaryColor: "#8b5cf6",
        accentColor: "#3b82f6",
      },
    };
  }
}

// Export singleton instance
export const cmsService = new CMSService();
export default cmsService;
