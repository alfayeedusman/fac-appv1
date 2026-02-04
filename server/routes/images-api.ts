import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { supabaseDbService } from '../services/supabaseDatabaseService';
import * as schema from '../database/schema';
import { eq, desc, and, like, inArray, count } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'images');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error, uploadDir);
    }
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

// File filter for images only
const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// Middleware to parse JSON
router.use(express.json());

/**
 * Upload single image
 * POST /api/images/upload
 */
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided'
      });
    }

    const {
      category = 'general',
      associatedWith,
      associatedId,
      altText,
      description,
      tags = '[]',
      uploadedBy
    } = req.body;

    // Parse tags if it's a JSON string
    let parsedTags: string[] = [];
    try {
      parsedTags = JSON.parse(tags);
    } catch (e) {
      parsedTags = [];
    }

    // Get image dimensions (would need image processing library like sharp)
    // For now, we'll set them as null and they can be updated later
    const imageData = {
      id: createId(),
      originalName: req.file.originalname,
      fileName: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
      width: null,
      height: null,
      storageType: 'local',
      storagePath: `/uploads/images/${req.file.filename}`,
      publicUrl: `/uploads/images/${req.file.filename}`,
      category,
      tags: parsedTags,
      uploadedBy: uploadedBy || null,
      associatedWith: associatedWith || null,
      associatedId: associatedId || null,
      altText: altText || null,
      description: description || null,
      processingStatus: 'completed',
      downloadCount: 0,
      viewCount: 0,
      isActive: true,
      isPublic: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await supabaseDbService.db.insert(schema.images).values(imageData);

    res.json({
      success: true,
      data: {
        id: imageData.id,
        fileName: imageData.fileName,
        originalName: imageData.originalName,
        publicUrl: imageData.publicUrl,
        category: imageData.category,
        size: imageData.size,
        mimeType: imageData.mimeType,
      },
      message: 'Image uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload image'
    });
  }
});

/**
 * Upload multiple images
 * POST /api/images/upload-multiple
 */
router.post('/upload-multiple', upload.array('images', 10), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No image files provided'
      });
    }

    const {
      category = 'general',
      associatedWith,
      associatedId,
      altText,
      description,
      tags = '[]',
      uploadedBy
    } = req.body;

    // Parse tags if it's a JSON string
    let parsedTags: string[] = [];
    try {
      parsedTags = JSON.parse(tags);
    } catch (e) {
      parsedTags = [];
    }

    const uploadedImages = [];

    for (const file of files) {
      const imageData = {
        id: createId(),
        originalName: file.originalname,
        fileName: file.filename,
        mimeType: file.mimetype,
        size: file.size,
        width: null,
        height: null,
        storageType: 'local',
        storagePath: `/uploads/images/${file.filename}`,
        publicUrl: `/uploads/images/${file.filename}`,
        category,
        tags: parsedTags,
        uploadedBy: uploadedBy || null,
        associatedWith: associatedWith || null,
        associatedId: associatedId || null,
        altText: altText || null,
        description: description || null,
        processingStatus: 'completed',
        downloadCount: 0,
        viewCount: 0,
        isActive: true,
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await supabaseDbService.db.insert(schema.images).values(imageData);
      
      uploadedImages.push({
        id: imageData.id,
        fileName: imageData.fileName,
        originalName: imageData.originalName,
        publicUrl: imageData.publicUrl,
        category: imageData.category,
        size: imageData.size,
        mimeType: imageData.mimeType,
      });
    }

    res.json({
      success: true,
      data: uploadedImages,
      message: `${uploadedImages.length} images uploaded successfully`
    });
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload images'
    });
  }
});

/**
 * Get all images with filtering and pagination
 * GET /api/images
 */
router.get('/', async (req, res) => {
  try {
    // Check if database is available
    if (!supabaseDbService.db) {
      return res.json({
        success: true,
        data: [],
        pagination: {
          page: 1,
          limit: 50,
          total: 0,
          pages: 0
        }
      });
    }
    const {
      page = '1',
      limit = '20',
      category,
      tags,
      search,
      associatedWith,
      associatedId,
      uploadedBy,
      isActive = 'true'
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;

    // Build query conditions
    const conditions = [];

    if (category) {
      conditions.push(eq(schema.images.category, category as string));
    }

    if (associatedWith) {
      conditions.push(eq(schema.images.associatedWith, associatedWith as string));
    }

    if (associatedId) {
      conditions.push(eq(schema.images.associatedId, associatedId as string));
    }

    if (uploadedBy) {
      conditions.push(eq(schema.images.uploadedBy, uploadedBy as string));
    }

    if (isActive !== 'all') {
      conditions.push(eq(schema.images.isActive, isActive === 'true'));
    }

    if (search) {
      conditions.push(
        like(schema.images.originalName, `%${search}%`)
      );
    }

    // Get images
    const imageList = await supabaseDbService.db
      .select()
      .from(schema.images)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(schema.images.createdAt))
      .limit(limitNum)
      .offset(offset);

    // Get total count
    const totalResult = await supabaseDbService.db
      .select({ count: count() })
      .from(schema.images)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const total = totalResult[0]?.count || 0;

    res.json({
      success: true,
      data: imageList,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Error getting images:', error);
    // Return empty list if tables don't exist yet
    res.json({
      success: true,
      data: [],
      pagination: {
        page: 1,
        limit: 50,
        total: 0,
        pages: 0
      }
    });
  }
});

/**
 * Get all image collections
 * GET /api/images/collections
 */
router.get('/collections', async (req, res) => {
  try {
    // Check if database is available
    if (!supabaseDbService.db) {
      return res.json({
        success: true,
        data: []
      });
    }
    const { category, isPublic, createdBy } = req.query;

    const conditions = [];

    if (category) {
      conditions.push(eq(schema.imageCollections.category, category as string));
    }

    if (isPublic !== undefined) {
      conditions.push(eq(schema.imageCollections.isPublic, isPublic === 'true'));
    }

    if (createdBy) {
      conditions.push(eq(schema.imageCollections.createdBy, createdBy as string));
    }

    const collections = await supabaseDbService.db
      .select()
      .from(schema.imageCollections)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(schema.imageCollections.sortOrder, desc(schema.imageCollections.createdAt));

    res.json({
      success: true,
      data: collections
    });
  } catch (error) {
    console.error('Error getting image collections:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get image collections'
    });
  }
});

/**
 * Get image statistics
 * GET /api/images/stats
 */
router.get('/stats', async (req, res) => {
  try {
    // Check if database is available
    if (!supabaseDbService.db) {
      return res.status(500).json({
        success: false,
        error: 'Database connection not available'
      });
    }

    // Get total images count
    const totalImagesResult = await supabaseDbService.db
      .select({ count: count() })
      .from(schema.images)
      .where(eq(schema.images.isActive, true));

    // Get images by category
    const categoryStats = await supabaseDbService.db
      .select({
        category: schema.images.category,
        count: count(),
      })
      .from(schema.images)
      .where(eq(schema.images.isActive, true))
      .groupBy(schema.images.category);

    // Get storage usage
    const storageResult = await supabaseDbService.db
      .select({
        totalSize: schema.images.size,
      })
      .from(schema.images)
      .where(eq(schema.images.isActive, true));

    const totalStorage = storageResult.reduce((sum, item) => sum + (item.totalSize || 0), 0);

    res.json({
      success: true,
      data: {
        totalImages: totalImagesResult[0]?.count || 0,
        categoryBreakdown: categoryStats,
        totalStorageBytes: totalStorage,
        totalStorageMB: Math.round(totalStorage / (1024 * 1024) * 100) / 100,
      }
    });
  } catch (error) {
    console.error('Error getting image stats:', error);
    // Return empty stats if tables don't exist yet
    res.json({
      success: true,
      data: {
        totalImages: 0,
        categoryBreakdown: [],
        totalStorageBytes: 0,
        totalStorageMB: 0,
      }
    });
  }
});

/**
 * Get single image by ID
 * GET /api/images/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { incrementView = 'true' } = req.query;

    const imageList = await supabaseDbService.db
      .select()
      .from(schema.images)
      .where(eq(schema.images.id, id))
      .limit(1);

    if (imageList.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Image not found'
      });
    }

    const image = imageList[0];

    // Increment view count if requested
    if (incrementView === 'true') {
      await supabaseDbService.db
        .update(schema.images)
        .set({
          viewCount: (image.viewCount || 0) + 1,
          updatedAt: new Date()
        })
        .where(eq(schema.images.id, id));
    }

    res.json({
      success: true,
      data: image
    });
  } catch (error) {
    console.error('Error getting image:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get image'
    });
  }
});

/**
 * Update image metadata
 * PUT /api/images/:id
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      altText,
      description,
      tags,
      category,
      isActive,
      isPublic
    } = req.body;

    const updateData: any = {
      updatedAt: new Date()
    };

    if (altText !== undefined) updateData.altText = altText;
    if (description !== undefined) updateData.description = description;
    if (tags !== undefined) updateData.tags = tags;
    if (category !== undefined) updateData.category = category;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (isPublic !== undefined) updateData.isPublic = isPublic;

    const result = await supabaseDbService.db
      .update(schema.images)
      .set(updateData)
      .where(eq(schema.images.id, id));

    res.json({
      success: true,
      message: 'Image updated successfully'
    });
  } catch (error) {
    console.error('Error updating image:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update image'
    });
  }
});

/**
 * Delete image
 * DELETE /api/images/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { deleteFile = 'true' } = req.query;

    // Get image info first
    const imageList = await supabaseDbService.db
      .select()
      .from(schema.images)
      .where(eq(schema.images.id, id))
      .limit(1);

    if (imageList.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Image not found'
      });
    }

    const image = imageList[0];

    // Delete from database
    await supabaseDbService.db.delete(schema.images).where(eq(schema.images.id, id));

    // Delete physical file if requested and it's local storage
    if (deleteFile === 'true' && image.storageType === 'local') {
      try {
        const filePath = path.join(process.cwd(), 'public', image.storagePath);
        await fs.unlink(filePath);
      } catch (fileError) {
        console.warn('Failed to delete physical file:', fileError);
      }
    }

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete image'
    });
  }
});

/**
 * Create image collection
 * POST /api/images/collections
 */
router.post('/collections', async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      isPublic = true,
      sortOrder = 0,
      createdBy
    } = req.body;

    if (!name || !category || !createdBy) {
      return res.status(400).json({
        success: false,
        error: 'Name, category, and createdBy are required'
      });
    }

    const collectionData = {
      id: createId(),
      name,
      description,
      category,
      isPublic,
      sortOrder,
      createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await supabaseDbService.db.insert(schema.imageCollections).values(collectionData);

    res.json({
      success: true,
      data: collectionData,
      message: 'Image collection created successfully'
    });
  } catch (error) {
    console.error('Error creating image collection:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create image collection'
    });
  }
});

/**
 * Add images to collection
 * POST /api/images/collections/:collectionId/images
 */
router.post('/collections/:collectionId/images', async (req, res) => {
  try {
    const { collectionId } = req.params;
    const { imageIds, captions = [] } = req.body;

    if (!Array.isArray(imageIds) || imageIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Image IDs array is required'
      });
    }

    const collectionItems = imageIds.map((imageId: string, index: number) => ({
      id: createId(),
      collectionId,
      imageId,
      sortOrder: index,
      caption: captions[index] || null,
      addedAt: new Date(),
    }));

    await supabaseDbService.db.insert(schema.imageCollectionItems).values(collectionItems);

    res.json({
      success: true,
      message: `${imageIds.length} images added to collection successfully`
    });
  } catch (error) {
    console.error('Error adding images to collection:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add images to collection'
    });
  }
});

/**
 * Get images in a collection
 * GET /api/images/collections/:collectionId/images
 */
router.get('/collections/:collectionId/images', async (req, res) => {
  try {
    const { collectionId } = req.params;

    const collectionImages = await supabaseDbService.db
      .select({
        id: schema.imageCollectionItems.id,
        sortOrder: schema.imageCollectionItems.sortOrder,
        caption: schema.imageCollectionItems.caption,
        addedAt: schema.imageCollectionItems.addedAt,
        imageId: schema.images.id,
        originalName: schema.images.originalName,
        fileName: schema.images.fileName,
        publicUrl: schema.images.publicUrl,
        mimeType: schema.images.mimeType,
        size: schema.images.size,
        category: schema.images.category,
        altText: schema.images.altText,
        description: schema.images.description,
        createdAt: schema.images.createdAt,
      })
      .from(schema.imageCollectionItems)
      .innerJoin(schema.images, eq(schema.imageCollectionItems.imageId, schema.images.id))
      .where(eq(schema.imageCollectionItems.collectionId, collectionId))
      .orderBy(schema.imageCollectionItems.sortOrder);

    res.json({
      success: true,
      data: collectionImages
    });
  } catch (error) {
    console.error('Error getting collection images:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get collection images'
    });
  }
});

export default router;
