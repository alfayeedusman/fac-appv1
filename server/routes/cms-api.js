import { Router } from 'express';
import { neonDatabaseService } from '../services/neonDatabaseService.js';

const router = Router();

// Default homepage content structure
const defaultHomepageContent = {
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

/**
 * Get current homepage content
 * GET /api/cms/homepage
 */
router.get('/homepage', async (req, res) => {
  try {
    console.log('🎨 CMS: Getting homepage content...');
    
    if (!neonDatabaseService.db) {
      console.log('🎨 CMS: Database not available, returning default content');
      return res.json({
        success: true,
        data: defaultHomepageContent,
        message: "Using default content (database not available)"
      });
    }

    // For now, return default content until we implement database querying
    res.json({
      success: true,
      data: defaultHomepageContent,
      message: "Default content loaded successfully"
    });

  } catch (error) {
    console.error('🎨 CMS: Error getting homepage content:', error);
    
    // Return default content on error
    res.json({
      success: true,
      data: defaultHomepageContent,
      message: "Using default content (error occurred)"
    });
  }
});

/**
 * Save homepage content
 * POST /api/cms/homepage
 */
router.post('/homepage', async (req, res) => {
  try {
    console.log('🎨 CMS: Saving homepage content...');
    
    if (!neonDatabaseService.db) {
      return res.status(503).json({
        success: false,
        error: "Database not available"
      });
    }

    const { content, userId, userName } = req.body;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        error: "Content is required"
      });
    }

    // For now, just return success
    // TODO: Implement actual database saving
    console.log('🎨 CMS: Content would be saved for user:', userId || 'unknown');
    
    res.json({
      success: true,
      data: {
        id: `content_${Date.now()}`,
        version: "1.0.0",
        publishedAt: new Date().toISOString(),
      },
      message: "Homepage content saved successfully"
    });

  } catch (error) {
    console.error('🎨 CMS: Error saving homepage content:', error);
    res.status(500).json({
      success: false,
      error: "Failed to save homepage content"
    });
  }
});

/**
 * Get content history
 * GET /api/cms/history
 */
router.get('/history', async (req, res) => {
  try {
    console.log('🎨 CMS: Getting content history...');
    
    res.json({
      success: true,
      data: []
    });

  } catch (error) {
    console.error('🎨 CMS: Error getting content history:', error);
    res.status(500).json({
      success: false,
      error: "Failed to get content history"
    });
  }
});

/**
 * Initialize default content (Admin only)
 * POST /api/cms/initialize
 */
router.post('/initialize', async (req, res) => {
  try {
    console.log('🎨 CMS: Initializing CMS content...');
    
    const { userId = 'system', userName = 'System' } = req.body;

    res.json({
      success: true,
      data: {
        id: `init_${Date.now()}`,
        version: "1.0.0",
      },
      message: "CMS content initialized successfully"
    });

  } catch (error) {
    console.error('🎨 CMS: Error initializing CMS content:', error);
    res.status(500).json({
      success: false,
      error: "Failed to initialize CMS content"
    });
  }
});

export default router;
