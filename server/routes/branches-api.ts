import express, { RequestHandler } from 'express';
import { getSqlClient } from '../database/connection';

const router = express.Router();

// Get SQL client on demand
async function getSql() {
  return await getSqlClient();
}

// ============= BRANCHES ENDPOINTS =============

// Get all branches
export const getBranches: RequestHandler = async (req, res) => {
  try {
    const { city, isActive, type, search } = req.query;
    
    let query = `SELECT * FROM branches WHERE 1=1`;
    const params: any[] = [];
    let paramIndex = 1;

    if (city) {
      query += ` AND LOWER(city) = LOWER($${paramIndex})`;
      params.push(city);
      paramIndex++;
    }

    if (isActive !== undefined) {
      query += ` AND is_active = $${paramIndex}`;
      params.push(isActive === 'true');
      paramIndex++;
    }

    if (type) {
      query += ` AND type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    if (search) {
      query += ` AND (LOWER(name) LIKE LOWER($${paramIndex}) OR LOWER(address) LIKE LOWER($${paramIndex + 1}) OR LOWER(code) LIKE LOWER($${paramIndex + 2}))`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      paramIndex += 3;
    }

    query += ` ORDER BY is_main_branch DESC, name ASC`;

    const branches = await sql(query, params);

    res.json({
      success: true,
      branches: branches || []
    });
  } catch (error: any) {
    console.error('Get branches error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch branches'
    });
  }
};

// Get single branch by ID
export const getBranchById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const branches = await sql`
      SELECT * FROM branches 
      WHERE id = ${id}
      LIMIT 1
    `;

    if (!branches || branches.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Branch not found'
      });
    }

    res.json({
      success: true,
      branch: branches[0]
    });
  } catch (error: any) {
    console.error('Get branch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch branch'
    });
  }
};

// Get branch by code
export const getBranchByCode: RequestHandler = async (req, res) => {
  try {
    const { code } = req.params;

    const branches = await sql`
      SELECT * FROM branches 
      WHERE code = ${code} AND is_active = true
      LIMIT 1
    `;

    if (!branches || branches.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Branch not found'
      });
    }

    res.json({
      success: true,
      branch: branches[0]
    });
  } catch (error: any) {
    console.error('Get branch by code error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch branch'
    });
  }
};

// Create new branch
export const createBranch: RequestHandler = async (req, res) => {
  try {
    const {
      name, code, type, address, city, state, postalCode, country,
      phone, email, latitude, longitude, timezone, managerName, managerPhone,
      capacity, services, specializations, operatingHours, hasWifi,
      hasParking, hasWaitingArea, has24HourService, images, logoUrl
    } = req.body;

    // Check if branch code already exists
    const existingBranch = await sql`
      SELECT id FROM branches WHERE code = ${code} LIMIT 1
    `;

    if (existingBranch && existingBranch.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Branch code already exists'
      });
    }

    // Generate unique ID
    const branchId = `branch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const result = await sql`
      INSERT INTO branches (
        id, name, code, type, address, city, state, postal_code, country,
        phone, email, latitude, longitude, timezone, manager_name, manager_phone,
        capacity, services, specializations, operating_hours, has_wifi,
        has_parking, has_waiting_area, has_24_hour_service, images, logo_url,
        created_at, updated_at
      ) VALUES (
        ${branchId}, ${name}, ${code}, ${type || 'full_service'}, ${address},
        ${city}, ${state || null}, ${postalCode || null}, ${country || 'Philippines'},
        ${phone || null}, ${email || null}, ${latitude || null}, ${longitude || null},
        ${timezone || 'Asia/Manila'}, ${managerName || null}, ${managerPhone || null},
        ${capacity || 10}, ${JSON.stringify(services || [])}, 
        ${JSON.stringify(specializations || [])}, ${JSON.stringify(operatingHours || {})},
        ${hasWifi !== undefined ? hasWifi : true}, ${hasParking !== undefined ? hasParking : true},
        ${hasWaitingArea !== undefined ? hasWaitingArea : true}, 
        ${has24HourService !== undefined ? has24HourService : false},
        ${JSON.stringify(images || [])}, ${logoUrl || null}, NOW(), NOW()
      ) RETURNING *
    `;

    res.status(201).json({
      success: true,
      branch: result[0],
      message: 'Branch created successfully'
    });
  } catch (error: any) {
    console.error('Create branch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create branch'
    });
  }
};

// Update branch
export const updateBranch: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = req.body;

    // Remove id and timestamps from update fields
    delete updateFields.id;
    delete updateFields.createdAt;
    updateFields.updatedAt = new Date();

    // Convert arrays to JSON strings for database storage
    if (updateFields.services) updateFields.services = JSON.stringify(updateFields.services);
    if (updateFields.specializations) updateFields.specializations = JSON.stringify(updateFields.specializations);
    if (updateFields.operatingHours) updateFields.operatingHours = JSON.stringify(updateFields.operatingHours);
    if (updateFields.images) updateFields.images = JSON.stringify(updateFields.images);

    // Build dynamic update query
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
      UPDATE branches 
      SET ${setClause}
      WHERE id = $1 
      RETURNING *
    `;

    const result = await sql(query, [id, ...updateValues]);

    if (!result || result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Branch not found'
      });
    }

    res.json({
      success: true,
      branch: result[0],
      message: 'Branch updated successfully'
    });
  } catch (error: any) {
    console.error('Update branch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update branch'
    });
  }
};

// Delete branch (soft delete)
export const deleteBranch: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if this is the main branch
    const branch = await sql`
      SELECT is_main_branch FROM branches WHERE id = ${id} LIMIT 1
    `;

    if (branch && branch.length > 0 && branch[0].is_main_branch) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete the main branch'
      });
    }

    const result = await sql`
      UPDATE branches 
      SET is_active = false, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (!result || result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Branch not found'
      });
    }

    res.json({
      success: true,
      message: 'Branch deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete branch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete branch'
    });
  }
};

// Get branches near a location
export const getNearbyBranches: RequestHandler = async (req, res) => {
  try {
    const { latitude, longitude, radius = 10 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      });
    }

    // Using Haversine formula for distance calculation
    const query = `
      SELECT *,
        (6371 * acos(cos(radians($1)) * cos(radians(latitude)) * 
        cos(radians(longitude) - radians($2)) + sin(radians($1)) * 
        sin(radians(latitude)))) AS distance
      FROM branches 
      WHERE is_active = true 
        AND latitude IS NOT NULL 
        AND longitude IS NOT NULL
      HAVING distance <= $3
      ORDER BY distance ASC
    `;

    const branches = await sql(query, [latitude, longitude, radius]);

    res.json({
      success: true,
      branches: branches || []
    });
  } catch (error: any) {
    console.error('Get nearby branches error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch nearby branches'
    });
  }
};

// Get branch statistics
export const getBranchStats: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { period = '30' } = req.query; // days

    // Get basic branch info
    const branch = await sql`
      SELECT * FROM branches WHERE id = ${id} LIMIT 1
    `;

    if (!branch || branch.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Branch not found'
      });
    }

    // Get booking statistics for the branch
    const bookingStats = await sql`
      SELECT 
        COUNT(*) as total_bookings,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_bookings,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_bookings,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_bookings,
        AVG(CASE WHEN customer_rating IS NOT NULL THEN customer_rating END) as avg_rating,
        SUM(CASE WHEN status = 'completed' THEN total_price ELSE 0 END) as total_revenue
      FROM bookings 
      WHERE branch = ${branch[0].name}
        AND created_at >= NOW() - INTERVAL '${period} days'
    `;

    // Get crew count for the branch
    const crewStats = await sql`
      SELECT 
        COUNT(*) as total_crew,
        COUNT(CASE WHEN crew_status = 'available' THEN 1 END) as available_crew,
        COUNT(CASE WHEN crew_status = 'busy' THEN 1 END) as busy_crew,
        COUNT(CASE WHEN crew_status = 'offline' THEN 1 END) as offline_crew
      FROM users 
      WHERE role = 'crew' 
        AND branch_location = ${branch[0].name}
        AND is_active = true
    `;

    res.json({
      success: true,
      branch: branch[0],
      stats: {
        bookings: bookingStats[0] || {},
        crew: crewStats[0] || {},
        period: `${period} days`
      }
    });
  } catch (error: any) {
    console.error('Get branch stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch branch statistics'
    });
  }
};

// Get branch operating hours for a specific date
export const getBranchHours: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    const branch = await sql`
      SELECT operating_hours, timezone FROM branches 
      WHERE id = ${id} AND is_active = true
      LIMIT 1
    `;

    if (!branch || branch.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Branch not found'
      });
    }

    const operatingHours = branch[0].operating_hours || {};
    const timezone = branch[0].timezone || 'Asia/Manila';

    // Get day of week for the specified date
    const targetDate = date ? new Date(date as string) : new Date();
    const dayOfWeek = targetDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      timeZone: timezone 
    }).toLowerCase();

    const dayHours = operatingHours[dayOfWeek] || null;

    res.json({
      success: true,
      date: targetDate.toISOString().split('T')[0],
      dayOfWeek,
      hours: dayHours,
      timezone,
      isOpen: dayHours && !dayHours.closed
    });
  } catch (error: any) {
    console.error('Get branch hours error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch branch hours'
    });
  }
};

export default router;
