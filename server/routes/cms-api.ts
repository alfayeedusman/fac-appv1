import { Router } from 'express';
import { neonDbService } from '../services/neonDatabaseService';
import {
  homepageContent,
  cmsContentHistory,
  cmsSettings,
  type HomepageContent,
  type NewHomepageContent
} from '../database/cmsSchema';
import { eq, desc, and } from 'drizzle-orm';

const router = Router();

// Default homepage content structure
const defaultHomepageContent = {
  heroSection: {
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
        variant: "primary" as const,
        enabled: true,
      },
      {
        id: "cta2",
        text: "Login",
        link: "/login",
        variant: "outline" as const,
        enabled: true,
      },
      {
        id: "cta3",
        text: "Book Now",
        link: "/guest-booking",
        variant: "outline" as const,
        enabled: true,
      },
    ],
  },
  servicesSection: {
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
  visionMissionSection: {
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
  locationsSection: {
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
  footerSection: {
    companyName: "Fayeed Auto Care",
    tagline: "Zamboanga's First Smart Carwash & Auto Detailing Service",
    poweredBy: "Fdigitals",
    copyright: "© 2025 Fayeed Auto Care",
  },
  themeSettings: {
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
    if (!neonDbService.db) {
      return res.json({
        success: true,
        data: defaultHomepageContent,
        message: "Using default content (database not available)"
      });
    }

    // Get the active homepage content
    const [activeContent] = await neonDbService.db
      .select()
      .from(homepageContent)
      .where(eq(homepageContent.isActive, true))
      .orderBy(desc(homepageContent.updatedAt))
      .limit(1);

    if (!activeContent) {
      // Return default content if none exists
      return res.json({
        success: true,
        data: defaultHomepageContent,
        message: "Using default content (no content found)"
      });
    }

    // Combine all sections into the expected format
    const responseContent = {
      hero: activeContent.heroSection,
      services: activeContent.servicesSection,
      visionMission: activeContent.visionMissionSection,
      locations: activeContent.locationsSection,
      footer: activeContent.footerSection,
      theme: activeContent.themeSettings,
    };

    res.json({
      success: true,
      data: responseContent,
      metadata: {
        id: activeContent.id,
        version: activeContent.version,
        lastUpdated: activeContent.updatedAt,
        publishedAt: activeContent.publishedAt,
      }
    });

  } catch (error) {
    console.error('Error getting homepage content:', error);
    
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
    if (!neonDbService.db) {
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

    // Get current active content for history tracking
    const [currentContent] = await neonDbService.db
      .select()
      .from(homepageContent)
      .where(eq(homepageContent.isActive, true))
      .limit(1);

    // Deactivate current content
    if (currentContent) {
      await neonDbService.db
        .update(homepageContent)
        .set({ isActive: false })
        .where(eq(homepageContent.id, currentContent.id));
    }

    // Create new content record
    const newContentData: NewHomepageContent = {
      heroSection: content.hero || defaultHomepageContent.heroSection,
      servicesSection: content.services || defaultHomepageContent.servicesSection,
      visionMissionSection: content.visionMission || defaultHomepageContent.visionMissionSection,
      locationsSection: content.locations || defaultHomepageContent.locationsSection,
      footerSection: content.footer || defaultHomepageContent.footerSection,
      themeSettings: content.theme || defaultHomepageContent.themeSettings,
      isActive: true,
      publishedAt: new Date(),
      createdBy: userId || 'system',
      updatedBy: userId || 'system',
    };

    const [savedContent] = await neonDbService.db
      .insert(homepageContent)
      .values(newContentData)
      .returning();

    // Create history record
    await neonDbService.db
      .insert(cmsContentHistory)
      .values({
        contentId: savedContent.id,
        action: currentContent ? 'update' : 'create',
        contentSnapshot: newContentData,
        changeDescription: currentContent ? 'Content updated via CMS' : 'Initial content creation',
        changedBy: userId || 'system',
        changedByName: userName || 'System',
      });

    res.json({
      success: true,
      data: {
        id: savedContent.id,
        version: savedContent.version,
        publishedAt: savedContent.publishedAt,
      },
      message: "Homepage content saved successfully"
    });

  } catch (error) {
    console.error('Error saving homepage content:', error);
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
    if (!neonDbService.db) {
      return res.json({
        success: true,
        data: [],
        message: "Database not available"
      });
    }

    const { limit = 20, offset = 0 } = req.query;

    const history = await neonDbService.db
      .select({
        id: cmsContentHistory.id,
        contentId: cmsContentHistory.contentId,
        action: cmsContentHistory.action,
        changeDescription: cmsContentHistory.changeDescription,
        changedBy: cmsContentHistory.changedBy,
        changedByName: cmsContentHistory.changedByName,
        createdAt: cmsContentHistory.createdAt,
      })
      .from(cmsContentHistory)
      .orderBy(desc(cmsContentHistory.createdAt))
      .limit(Number(limit))
      .offset(Number(offset));

    res.json({
      success: true,
      data: history
    });

  } catch (error) {
    console.error('Error getting content history:', error);
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
    if (!neonDbService.db) {
      return res.status(503).json({
        success: false,
        error: "Database not available"
      });
    }

    const { userId = 'system', userName = 'System' } = req.body;

    // Check if content already exists
    const [existingContent] = await neonDbService.db
      .select()
      .from(homepageContent)
      .where(eq(homepageContent.isActive, true))
      .limit(1);

    if (existingContent) {
      return res.json({
        success: true,
        message: "Content already initialized",
        data: { id: existingContent.id }
      });
    }

    // Create initial content
    const newContentData: NewHomepageContent = {
      ...defaultHomepageContent,
      isActive: true,
      publishedAt: new Date(),
      createdBy: userId,
      updatedBy: userId,
    };

    const [savedContent] = await neonDbService.db
      .insert(homepageContent)
      .values(newContentData)
      .returning();

    // Create history record
    await neonDbService.db
      .insert(cmsContentHistory)
      .values({
        contentId: savedContent.id,
        action: 'create',
        contentSnapshot: newContentData,
        changeDescription: 'Initial content setup',
        changedBy: userId,
        changedByName: userName,
      });

    res.json({
      success: true,
      data: {
        id: savedContent.id,
        version: savedContent.version,
      },
      message: "CMS content initialized successfully"
    });

  } catch (error) {
    console.error('Error initializing CMS content:', error);
    res.status(500).json({
      success: false,
      error: "Failed to initialize CMS content"
    });
  }
});

export default router;
