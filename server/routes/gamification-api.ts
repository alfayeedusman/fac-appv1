import express, { RequestHandler } from 'express';
import { neon } from '@neondatabase/serverless';

const router = express.Router();

// Initialize Neon SQL client
const DATABASE_URL = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL || '';
const sql = DATABASE_URL ? neon(DATABASE_URL) : null as any;

// ============= CUSTOMER LEVELS ENDPOINTS =============

// Get all customer levels
export const getCustomerLevels: RequestHandler = async (req, res) => {
  try {
    const { isActive } = req.query;
    
    let query = `SELECT * FROM customer_levels WHERE 1=1`;
    const params: any[] = [];

    if (isActive !== undefined) {
      query += ` AND is_active = $1`;
      params.push(isActive === 'true');
    }

    query += ` ORDER BY min_points ASC, sort_order ASC`;

    const levels = await sql(query, params);

    res.json({
      success: true,
      levels: levels || []
    });
  } catch (error: any) {
    console.error('Get customer levels error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch customer levels'
    });
  }
};

// Create customer level
export const createCustomerLevel: RequestHandler = async (req, res) => {
  try {
    const {
      name, description, minPoints, maxPoints, discountPercentage,
      priority, specialPerks, badgeIcon, badgeColor, levelColor, sortOrder
    } = req.body;

    const levelId = `level_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const result = await sql`
      INSERT INTO customer_levels (
        id, name, description, min_points, max_points, discount_percentage,
        priority, special_perks, badge_icon, badge_color, level_color,
        sort_order, created_at, updated_at
      ) VALUES (
        ${levelId}, ${name}, ${description}, ${minPoints}, ${maxPoints || null},
        ${discountPercentage || 0}, ${priority || 0}, 
        ${JSON.stringify(specialPerks || [])}, ${badgeIcon || null},
        ${badgeColor || '#6B7280'}, ${levelColor || '#F97316'},
        ${sortOrder || 0}, NOW(), NOW()
      ) RETURNING *
    `;

    res.status(201).json({
      success: true,
      level: result[0],
      message: 'Customer level created successfully'
    });
  } catch (error: any) {
    console.error('Create customer level error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create customer level'
    });
  }
};

// Update customer level
export const updateCustomerLevel: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = req.body;

    delete updateFields.id;
    delete updateFields.createdAt;
    updateFields.updatedAt = new Date();

    if (updateFields.specialPerks) {
      updateFields.specialPerks = JSON.stringify(updateFields.specialPerks);
    }

    const updateKeys = Object.keys(updateFields);
    const updateValues = Object.values(updateFields);
    
    if (updateKeys.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    const setClause = updateKeys.map((key, index) => 
      `${key.replace(/([A-Z])/g, '_$1').toLowerCase()} = $${index + 2}`
    ).join(', ');

    const query = `
      UPDATE customer_levels 
      SET ${setClause}
      WHERE id = $1 
      RETURNING *
    `;

    const result = await sql(query, [id, ...updateValues]);

    if (!result || result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Customer level not found'
      });
    }

    res.json({
      success: true,
      level: result[0],
      message: 'Customer level updated successfully'
    });
  } catch (error: any) {
    console.error('Update customer level error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update customer level'
    });
  }
};

// Get user's current level
export const getUserLevel: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user's current points
    const user = await sql`
      SELECT loyalty_points FROM users WHERE id = ${userId} LIMIT 1
    `;

    if (!user || user.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const userPoints = user[0].loyalty_points || 0;

    // Find the appropriate level
    const level = await sql`
      SELECT * FROM customer_levels 
      WHERE is_active = true 
        AND min_points <= ${userPoints}
        AND (max_points IS NULL OR max_points >= ${userPoints})
      ORDER BY min_points DESC
      LIMIT 1
    `;

    res.json({
      success: true,
      userPoints,
      currentLevel: level[0] || null
    });
  } catch (error: any) {
    console.error('Get user level error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user level'
    });
  }
};

// ============= ACHIEVEMENTS ENDPOINTS =============

// Get all achievements
export const getAchievements: RequestHandler = async (req, res) => {
  try {
    const { category, isActive } = req.query;
    
    let query = `SELECT * FROM achievements WHERE 1=1`;
    const params: any[] = [];
    let paramIndex = 1;

    if (category) {
      query += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (isActive !== undefined) {
      query += ` AND is_active = $${paramIndex}`;
      params.push(isActive === 'true');
      paramIndex++;
    }

    query += ` ORDER BY category, points_reward DESC`;

    const achievements = await sql(query, params);

    res.json({
      success: true,
      achievements: achievements || []
    });
  } catch (error: any) {
    console.error('Get achievements error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch achievements'
    });
  }
};

// Create achievement
export const createAchievement: RequestHandler = async (req, res) => {
  try {
    const {
      name, description, category, type, targetValue, requirementData,
      pointsReward, badgeIcon, badgeColor, isRepeatable, validFrom, validUntil
    } = req.body;

    const achievementId = `ach_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const result = await sql`
      INSERT INTO achievements (
        id, name, description, category, type, target_value, requirement_data,
        points_reward, badge_icon, badge_color, is_repeatable, valid_from,
        valid_until, created_at, updated_at
      ) VALUES (
        ${achievementId}, ${name}, ${description}, ${category}, ${type},
        ${targetValue || null}, ${JSON.stringify(requirementData || {})},
        ${pointsReward || 0}, ${badgeIcon || null}, ${badgeColor || '#10B981'},
        ${isRepeatable || false}, ${validFrom || null}, ${validUntil || null},
        NOW(), NOW()
      ) RETURNING *
    `;

    res.status(201).json({
      success: true,
      achievement: result[0],
      message: 'Achievement created successfully'
    });
  } catch (error: any) {
    console.error('Create achievement error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create achievement'
    });
  }
};

// Get user achievements
export const getUserAchievements: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const { completed } = req.query;

    let query = `
      SELECT ua.*, a.name, a.description, a.category, a.points_reward,
             a.badge_icon, a.badge_color, a.target_value
      FROM user_achievements ua
      JOIN achievements a ON ua.achievement_id = a.id
      WHERE ua.user_id = $1
    `;
    const params = [userId];

    if (completed !== undefined) {
      query += ` AND ua.completed = $2`;
      params.push(completed === 'true');
    }

    query += ` ORDER BY ua.completed_at DESC NULLS LAST, ua.created_at DESC`;

    const userAchievements = await sql(query, params);

    res.json({
      success: true,
      achievements: userAchievements || []
    });
  } catch (error: any) {
    console.error('Get user achievements error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user achievements'
    });
  }
};

// Award achievement to user
export const awardAchievement: RequestHandler = async (req, res) => {
  try {
    const { userId, achievementId, progress } = req.body;

    // Check if achievement already exists for user
    const existing = await sql`
      SELECT * FROM user_achievements 
      WHERE user_id = ${userId} AND achievement_id = ${achievementId}
      LIMIT 1
    `;

    if (existing && existing.length > 0) {
      // Update progress
      const result = await sql`
        UPDATE user_achievements 
        SET progress = ${progress}, updated_at = NOW()
        WHERE user_id = ${userId} AND achievement_id = ${achievementId}
        RETURNING *
      `;

      return res.json({
        success: true,
        userAchievement: result[0],
        message: 'Achievement progress updated'
      });
    }

    // Create new user achievement
    const userAchievementId = `ua_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const result = await sql`
      INSERT INTO user_achievements (
        id, user_id, achievement_id, progress, created_at, updated_at
      ) VALUES (
        ${userAchievementId}, ${userId}, ${achievementId}, ${progress || 0},
        NOW(), NOW()
      ) RETURNING *
    `;

    res.status(201).json({
      success: true,
      userAchievement: result[0],
      message: 'Achievement awarded successfully'
    });
  } catch (error: any) {
    console.error('Award achievement error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to award achievement'
    });
  }
};

// Complete achievement
export const completeAchievement: RequestHandler = async (req, res) => {
  try {
    const { userId, achievementId } = req.body;

    // Get achievement details
    const achievement = await sql`
      SELECT * FROM achievements WHERE id = ${achievementId} LIMIT 1
    `;

    if (!achievement || achievement.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Achievement not found'
      });
    }

    const pointsReward = achievement[0].points_reward || 0;

    // Update user achievement as completed
    const result = await sql`
      UPDATE user_achievements 
      SET completed = true, completed_at = NOW(), points_earned = ${pointsReward}
      WHERE user_id = ${userId} AND achievement_id = ${achievementId}
      RETURNING *
    `;

    if (!result || result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User achievement not found'
      });
    }

    // Add points to user's loyalty balance
    if (pointsReward > 0) {
      // Get current balance
      const user = await sql`
        SELECT loyalty_points FROM users WHERE id = ${userId} LIMIT 1
      `;

      const currentBalance = user[0]?.loyalty_points || 0;
      const newBalance = currentBalance + pointsReward;

      // Update user points
      await sql`
        UPDATE users 
        SET loyalty_points = ${newBalance}, updated_at = NOW()
        WHERE id = ${userId}
      `;

      // Record loyalty transaction
      const transactionId = `lt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await sql`
        INSERT INTO loyalty_transactions (
          id, user_id, type, amount, description, reference_type, reference_id,
          balance_before, balance_after, created_at
        ) VALUES (
          ${transactionId}, ${userId}, 'earned', ${pointsReward},
          'Achievement completed: ${achievement[0].name}', 'achievement', ${achievementId},
          ${currentBalance}, ${newBalance}, NOW()
        )
      `;
    }

    res.json({
      success: true,
      userAchievement: result[0],
      pointsEarned: pointsReward,
      message: 'Achievement completed successfully'
    });
  } catch (error: any) {
    console.error('Complete achievement error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to complete achievement'
    });
  }
};

// ============= LOYALTY TRANSACTIONS ENDPOINTS =============

// Get loyalty transactions for user
export const getLoyaltyTransactions: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const { type, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT * FROM loyalty_transactions 
      WHERE user_id = $1
    `;
    const params = [userId];
    let paramIndex = 2;

    if (type) {
      query += ` AND type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit as string), parseInt(offset as string));

    const transactions = await sql(query, params);

    // Get total count for pagination
    let countQuery = `SELECT COUNT(*) FROM loyalty_transactions WHERE user_id = $1`;
    const countParams = [userId];

    if (type) {
      countQuery += ` AND type = $2`;
      countParams.push(type);
    }

    const countResult = await sql(countQuery, countParams);
    const totalCount = parseInt(countResult[0]?.count || '0');

    res.json({
      success: true,
      transactions: transactions || [],
      pagination: {
        total: totalCount,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        hasMore: (parseInt(offset as string) + parseInt(limit as string)) < totalCount
      }
    });
  } catch (error: any) {
    console.error('Get loyalty transactions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch loyalty transactions'
    });
  }
};

// Add loyalty points (manual transaction)
export const addLoyaltyPoints: RequestHandler = async (req, res) => {
  try {
    const { userId, amount, description, referenceType, referenceId, processedBy } = req.body;

    if (!userId || !amount) {
      return res.status(400).json({
        success: false,
        error: 'User ID and amount are required'
      });
    }

    // Get current balance
    const user = await sql`
      SELECT loyalty_points FROM users WHERE id = ${userId} LIMIT 1
    `;

    if (!user || user.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const currentBalance = user[0].loyalty_points || 0;
    const newBalance = currentBalance + amount;

    // Update user points
    await sql`
      UPDATE users 
      SET loyalty_points = ${newBalance}, updated_at = NOW()
      WHERE id = ${userId}
    `;

    // Record transaction
    const transactionId = `lt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const result = await sql`
      INSERT INTO loyalty_transactions (
        id, user_id, type, amount, description, reference_type, reference_id,
        balance_before, balance_after, processed_by, created_at
      ) VALUES (
        ${transactionId}, ${userId}, 'earned', ${amount}, ${description || 'Manual points addition'},
        ${referenceType || 'manual'}, ${referenceId || null}, ${currentBalance}, ${newBalance},
        ${processedBy || null}, NOW()
      ) RETURNING *
    `;

    res.json({
      success: true,
      transaction: result[0],
      newBalance,
      message: 'Loyalty points added successfully'
    });
  } catch (error: any) {
    console.error('Add loyalty points error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add loyalty points'
    });
  }
};

// Redeem loyalty points
export const redeemLoyaltyPoints: RequestHandler = async (req, res) => {
  try {
    const { userId, amount, description, referenceType, referenceId } = req.body;

    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid user ID and positive amount are required'
      });
    }

    // Get current balance
    const user = await sql`
      SELECT loyalty_points FROM users WHERE id = ${userId} LIMIT 1
    `;

    if (!user || user.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const currentBalance = user[0].loyalty_points || 0;

    if (currentBalance < amount) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient loyalty points'
      });
    }

    const newBalance = currentBalance - amount;

    // Update user points
    await sql`
      UPDATE users 
      SET loyalty_points = ${newBalance}, updated_at = NOW()
      WHERE id = ${userId}
    `;

    // Record transaction
    const transactionId = `lt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const result = await sql`
      INSERT INTO loyalty_transactions (
        id, user_id, type, amount, description, reference_type, reference_id,
        balance_before, balance_after, created_at
      ) VALUES (
        ${transactionId}, ${userId}, 'redeemed', ${amount}, ${description || 'Points redemption'},
        ${referenceType || 'redemption'}, ${referenceId || null}, ${currentBalance}, ${newBalance},
        NOW()
      ) RETURNING *
    `;

    res.json({
      success: true,
      transaction: result[0],
      newBalance,
      message: 'Loyalty points redeemed successfully'
    });
  } catch (error: any) {
    console.error('Redeem loyalty points error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to redeem loyalty points'
    });
  }
};

// Get gamification dashboard data for user
export const getGamificationDashboard: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user's current level and points
    const user = await sql`
      SELECT loyalty_points FROM users WHERE id = ${userId} LIMIT 1
    `;

    if (!user || user.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const userPoints = user[0].loyalty_points || 0;

    // Get current level
    const currentLevel = await sql`
      SELECT * FROM customer_levels 
      WHERE is_active = true 
        AND min_points <= ${userPoints}
        AND (max_points IS NULL OR max_points >= ${userPoints})
      ORDER BY min_points DESC
      LIMIT 1
    `;

    // Get next level
    const nextLevel = await sql`
      SELECT * FROM customer_levels 
      WHERE is_active = true 
        AND min_points > ${userPoints}
      ORDER BY min_points ASC
      LIMIT 1
    `;

    // Get recent achievements
    const recentAchievements = await sql`
      SELECT ua.*, a.name, a.description, a.badge_icon, a.badge_color
      FROM user_achievements ua
      JOIN achievements a ON ua.achievement_id = a.id
      WHERE ua.user_id = ${userId} AND ua.completed = true
      ORDER BY ua.completed_at DESC
      LIMIT 5
    `;

    // Get progress on incomplete achievements
    const progressAchievements = await sql`
      SELECT ua.*, a.name, a.description, a.target_value, a.badge_icon
      FROM user_achievements ua
      JOIN achievements a ON ua.achievement_id = a.id
      WHERE ua.user_id = ${userId} AND ua.completed = false
      ORDER BY (ua.progress::float / NULLIF(a.target_value, 0)) DESC
      LIMIT 5
    `;

    // Get recent transactions
    const recentTransactions = await sql`
      SELECT * FROM loyalty_transactions 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 10
    `;

    res.json({
      success: true,
      dashboard: {
        userPoints,
        currentLevel: currentLevel[0] || null,
        nextLevel: nextLevel[0] || null,
        recentAchievements: recentAchievements || [],
        progressAchievements: progressAchievements || [],
        recentTransactions: recentTransactions || []
      }
    });
  } catch (error: any) {
    console.error('Get gamification dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch gamification dashboard'
    });
  }
};

export default router;
