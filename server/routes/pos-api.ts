import express, { RequestHandler } from 'express';
import { neon } from '@neondatabase/serverless';

const router = express.Router();

// Initialize Neon SQL client
const DATABASE_URL = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL || '';
const sql = DATABASE_URL ? neon(DATABASE_URL) : null as any;

// ============= POS CATEGORIES ENDPOINTS =============

// Get all POS categories
export const getPOSCategories: RequestHandler = async (req, res) => {
  try {
    const { isActive } = req.query;
    
    let query = `SELECT * FROM pos_categories WHERE 1=1`;
    const params: any[] = [];

    if (isActive !== undefined) {
      query += ` AND is_active = $1`;
      params.push(isActive === 'true');
    }

    query += ` ORDER BY sort_order ASC, name ASC`;

    const categories = await sql(query, params);

    res.json({
      success: true,
      categories: categories || []
    });
  } catch (error: any) {
    console.error('Get POS categories error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch POS categories'
    });
  }
};

// Create POS category
export const createPOSCategory: RequestHandler = async (req, res) => {
  try {
    const { name, description, icon, color, sortOrder } = req.body;

    const categoryId = `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const result = await sql`
      INSERT INTO pos_categories (
        id, name, description, icon, color, sort_order, created_at, updated_at
      ) VALUES (
        ${categoryId}, ${name}, ${description || null}, ${icon || null},
        ${color || '#F97316'}, ${sortOrder || 0}, NOW(), NOW()
      ) RETURNING *
    `;

    res.status(201).json({
      success: true,
      category: result[0],
      message: 'POS category created successfully'
    });
  } catch (error: any) {
    console.error('Create POS category error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create POS category'
    });
  }
};

// Update POS category
export const updatePOSCategory: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = req.body;

    delete updateFields.id;
    delete updateFields.createdAt;
    updateFields.updatedAt = new Date();

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
      UPDATE pos_categories 
      SET ${setClause}
      WHERE id = $1 
      RETURNING *
    `;

    const result = await sql(query, [id, ...updateValues]);

    if (!result || result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'POS category not found'
      });
    }

    res.json({
      success: true,
      category: result[0],
      message: 'POS category updated successfully'
    });
  } catch (error: any) {
    console.error('Update POS category error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update POS category'
    });
  }
};

// ============= POS PRODUCTS ENDPOINTS =============

// Get all POS products
export const getPOSProducts: RequestHandler = async (req, res) => {
  try {
    const { categoryId, isActive, isService, vehicleType, search } = req.query;
    
    let query = `
      SELECT p.*, c.name as category_name, c.color as category_color
      FROM pos_products p
      LEFT JOIN pos_categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (categoryId) {
      query += ` AND p.category_id = $${paramIndex}`;
      params.push(categoryId);
      paramIndex++;
    }

    if (isActive !== undefined) {
      query += ` AND p.is_active = $${paramIndex}`;
      params.push(isActive === 'true');
      paramIndex++;
    }

    if (isService !== undefined) {
      query += ` AND p.is_service = $${paramIndex}`;
      params.push(isService === 'true');
      paramIndex++;
    }

    if (vehicleType) {
      query += ` AND p.vehicle_types @> $${paramIndex}`;
      params.push(JSON.stringify([vehicleType]));
      paramIndex++;
    }

    if (search) {
      query += ` AND (LOWER(p.name) LIKE LOWER($${paramIndex}) OR LOWER(p.description) LIKE LOWER($${paramIndex + 1}) OR p.sku LIKE $${paramIndex + 2})`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      paramIndex += 3;
    }

    query += ` ORDER BY p.sort_order ASC, p.name ASC`;

    const products = await sql(query, params);

    res.json({
      success: true,
      products: products || []
    });
  } catch (error: any) {
    console.error('Get POS products error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch POS products'
    });
  }
};

// Get single POS product
export const getPOSProductById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const products = await sql`
      SELECT p.*, c.name as category_name
      FROM pos_products p
      LEFT JOIN pos_categories c ON p.category_id = c.id
      WHERE p.id = ${id}
      LIMIT 1
    `;

    if (!products || products.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'POS product not found'
      });
    }

    res.json({
      success: true,
      product: products[0]
    });
  } catch (error: any) {
    console.error('Get POS product error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch POS product'
    });
  }
};

// Create POS product
export const createPOSProduct: RequestHandler = async (req, res) => {
  try {
    const {
      name, description, categoryId, basePrice, carPrice, motorcyclePrice,
      suvPrice, truckPrice, sku, barcode, unit, trackInventory, currentStock,
      minStockLevel, isService, estimatedDuration, vehicleTypes, imageUrl,
      color, availableBranches, tags, sortOrder
    } = req.body;

    const productId = `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const result = await sql`
      INSERT INTO pos_products (
        id, name, description, category_id, base_price, car_price, motorcycle_price,
        suv_price, truck_price, sku, barcode, unit, track_inventory, current_stock,
        min_stock_level, is_service, estimated_duration, vehicle_types, image_url,
        color, available_branches, tags, sort_order, created_at, updated_at
      ) VALUES (
        ${productId}, ${name}, ${description || null}, ${categoryId || null},
        ${basePrice}, ${carPrice || null}, ${motorcyclePrice || null},
        ${suvPrice || null}, ${truckPrice || null}, ${sku || null},
        ${barcode || null}, ${unit || 'piece'}, ${trackInventory || false},
        ${currentStock || 0}, ${minStockLevel || 0}, ${isService || false},
        ${estimatedDuration || null}, ${JSON.stringify(vehicleTypes || ['car'])},
        ${imageUrl || null}, ${color || null}, ${JSON.stringify(availableBranches || [])},
        ${JSON.stringify(tags || [])}, ${sortOrder || 0}, NOW(), NOW()
      ) RETURNING *
    `;

    res.status(201).json({
      success: true,
      product: result[0],
      message: 'POS product created successfully'
    });
  } catch (error: any) {
    console.error('Create POS product error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create POS product'
    });
  }
};

// Update POS product
export const updatePOSProduct: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = req.body;

    delete updateFields.id;
    delete updateFields.createdAt;
    updateFields.updatedAt = new Date();

    // Convert arrays to JSON strings for database storage
    if (updateFields.vehicleTypes) updateFields.vehicleTypes = JSON.stringify(updateFields.vehicleTypes);
    if (updateFields.availableBranches) updateFields.availableBranches = JSON.stringify(updateFields.availableBranches);
    if (updateFields.tags) updateFields.tags = JSON.stringify(updateFields.tags);

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
      UPDATE pos_products 
      SET ${setClause}
      WHERE id = $1 
      RETURNING *
    `;

    const result = await sql(query, [id, ...updateValues]);

    if (!result || result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'POS product not found'
      });
    }

    res.json({
      success: true,
      product: result[0],
      message: 'POS product updated successfully'
    });
  } catch (error: any) {
    console.error('Update POS product error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update POS product'
    });
  }
};

// Update product stock
export const updateProductStock: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, type, reason, performedBy } = req.body;

    if (!quantity || !type) {
      return res.status(400).json({
        success: false,
        error: 'Quantity and type are required'
      });
    }

    // Get current stock
    const product = await sql`
      SELECT current_stock, name FROM pos_products WHERE id = ${id} LIMIT 1
    `;

    if (!product || product.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    const currentStock = product[0].current_stock || 0;
    let newStock = currentStock;

    // Calculate new stock based on type
    if (type === 'in') {
      newStock = currentStock + Math.abs(quantity);
    } else if (type === 'out') {
      newStock = Math.max(0, currentStock - Math.abs(quantity));
    } else if (type === 'adjustment') {
      newStock = Math.max(0, quantity);
    }

    // Update product stock
    await sql`
      UPDATE pos_products 
      SET current_stock = ${newStock}, updated_at = NOW()
      WHERE id = ${id}
    `;

    // Record stock movement
    const movementId = `mov_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await sql`
      INSERT INTO stock_movements (
        id, item_id, type, quantity, reason, performed_by, created_at
      ) VALUES (
        ${movementId}, ${id}, ${type}, ${quantity}, ${reason || null},
        ${performedBy || null}, NOW()
      )
    `;

    res.json({
      success: true,
      previousStock: currentStock,
      newStock,
      message: 'Product stock updated successfully'
    });
  } catch (error: any) {
    console.error('Update product stock error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update product stock'
    });
  }
};

// ============= POS TRANSACTIONS ENDPOINTS =============

// Get all transactions
export const getPOSTransactions: RequestHandler = async (req, res) => {
  try {
    const { branchId, cashierId, status, type, startDate, endDate, limit = 50, offset = 0 } = req.query;
    
    let query = `SELECT * FROM pos_transactions WHERE 1=1`;
    const params: any[] = [];
    let paramIndex = 1;

    if (branchId) {
      query += ` AND branch_id = $${paramIndex}`;
      params.push(branchId);
      paramIndex++;
    }

    if (cashierId) {
      query += ` AND cashier_id = $${paramIndex}`;
      params.push(cashierId);
      paramIndex++;
    }

    if (status) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (type) {
      query += ` AND type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    if (startDate) {
      query += ` AND created_at >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      query += ` AND created_at <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit as string), parseInt(offset as string));

    const transactions = await sql(query, params);

    res.json({
      success: true,
      transactions: transactions || []
    });
  } catch (error: any) {
    console.error('Get POS transactions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch POS transactions'
    });
  }
};

// Get single transaction with items
export const getPOSTransactionById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    // Get transaction
    const transactions = await sql`
      SELECT * FROM pos_transactions WHERE id = ${id} LIMIT 1
    `;

    if (!transactions || transactions.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    // Get transaction items
    const items = await sql`
      SELECT * FROM pos_transaction_items 
      WHERE transaction_id = ${id}
      ORDER BY created_at ASC
    `;

    res.json({
      success: true,
      transaction: {
        ...transactions[0],
        items: items || []
      }
    });
  } catch (error: any) {
    console.error('Get POS transaction error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch POS transaction'
    });
  }
};

// Create POS transaction
export const createPOSTransaction: RequestHandler = async (req, res) => {
  try {
    const {
      customerId, customerName, customerEmail, customerPhone, type,
      branchId, cashierId, cashierName, items, subtotal, taxAmount,
      discountAmount, totalAmount, paymentMethod, paymentReference,
      amountPaid, changeAmount, notes, pointsEarned, pointsRedeemed
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Transaction must have at least one item'
      });
    }

    // Generate transaction number
    const timestamp = Date.now();
    const transactionNumber = `TXN${timestamp}`;
    const transactionId = `txn_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;

    // Create transaction
    const transaction = await sql`
      INSERT INTO pos_transactions (
        id, transaction_number, customer_id, customer_name, customer_email,
        customer_phone, type, status, branch_id, cashier_id, cashier_name,
        subtotal, tax_amount, discount_amount, total_amount, payment_method,
        payment_reference, amount_paid, change_amount, notes, points_earned,
        points_redeemed, created_at, updated_at
      ) VALUES (
        ${transactionId}, ${transactionNumber}, ${customerId || null},
        ${customerName || null}, ${customerEmail || null}, ${customerPhone || null},
        ${type || 'sale'}, 'completed', ${branchId}, ${cashierId}, ${cashierName},
        ${subtotal}, ${taxAmount || 0}, ${discountAmount || 0}, ${totalAmount},
        ${paymentMethod}, ${paymentReference || null}, ${amountPaid},
        ${changeAmount || 0}, ${notes || null}, ${pointsEarned || 0},
        ${pointsRedeemed || 0}, NOW(), NOW()
      ) RETURNING *
    `;

    // Create transaction items
    const transactionItems = [];
    for (const item of items) {
      const itemId = `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const transactionItem = await sql`
        INSERT INTO pos_transaction_items (
          id, transaction_id, product_id, item_name, item_sku, item_category,
          unit_price, quantity, subtotal, discount_amount, final_price,
          vehicle_type, service_notes, created_at
        ) VALUES (
          ${itemId}, ${transactionId}, ${item.productId || null}, ${item.name},
          ${item.sku || null}, ${item.category || null}, ${item.unitPrice},
          ${item.quantity || 1}, ${item.subtotal}, ${item.discountAmount || 0},
          ${item.finalPrice}, ${item.vehicleType || null}, ${item.serviceNotes || null},
          NOW()
        ) RETURNING *
      `;

      transactionItems.push(transactionItem[0]);

      // Update product stock if it's a tracked inventory item
      if (item.productId && item.trackInventory) {
        await sql`
          UPDATE pos_products 
          SET current_stock = GREATEST(0, current_stock - ${item.quantity || 1})
          WHERE id = ${item.productId} AND track_inventory = true
        `;

        // Record stock movement
        const movementId = `mov_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await sql`
          INSERT INTO stock_movements (
            id, item_id, type, quantity, reason, reference, performed_by, created_at
          ) VALUES (
            ${movementId}, ${item.productId}, 'out', ${item.quantity || 1},
            'POS Sale', ${transactionNumber}, ${cashierId}, NOW()
          )
        `;
      }
    }

    // Award loyalty points if customer is registered
    if (customerId && pointsEarned > 0) {
      // Get current balance
      const user = await sql`
        SELECT loyalty_points FROM users WHERE id = ${customerId} LIMIT 1
      `;

      if (user && user.length > 0) {
        const currentBalance = user[0].loyalty_points || 0;
        const newBalance = currentBalance + pointsEarned;

        // Update user points
        await sql`
          UPDATE users 
          SET loyalty_points = ${newBalance}, updated_at = NOW()
          WHERE id = ${customerId}
        `;

        // Record loyalty transaction
        const loyaltyTxnId = `lt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await sql`
          INSERT INTO loyalty_transactions (
            id, user_id, type, amount, description, reference_type, reference_id,
            balance_before, balance_after, created_at
          ) VALUES (
            ${loyaltyTxnId}, ${customerId}, 'earned', ${pointsEarned},
            'POS Purchase', 'pos_transaction', ${transactionId},
            ${currentBalance}, ${newBalance}, NOW()
          )
        `;
      }
    }

    res.status(201).json({
      success: true,
      transaction: {
        ...transaction[0],
        items: transactionItems
      },
      message: 'POS transaction created successfully'
    });
  } catch (error: any) {
    console.error('Create POS transaction error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create POS transaction'
    });
  }
};

// Refund transaction
export const refundPOSTransaction: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, refundedBy, partialAmount } = req.body;

    // Get original transaction
    const transaction = await sql`
      SELECT * FROM pos_transactions WHERE id = ${id} LIMIT 1
    `;

    if (!transaction || transaction.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    if (transaction[0].status === 'refunded') {
      return res.status(400).json({
        success: false,
        error: 'Transaction already refunded'
      });
    }

    const refundAmount = partialAmount || transaction[0].total_amount;

    // Update original transaction
    await sql`
      UPDATE pos_transactions 
      SET status = 'refunded', refunded_at = NOW(), refund_reason = ${reason || null},
          refunded_by = ${refundedBy || null}, updated_at = NOW()
      WHERE id = ${id}
    `;

    // Create refund transaction
    const refundId = `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const refundNumber = `REF${Date.now()}`;

    const refundTransaction = await sql`
      INSERT INTO pos_transactions (
        id, transaction_number, customer_id, customer_name, type, status,
        branch_id, cashier_id, cashier_name, subtotal, total_amount,
        payment_method, amount_paid, notes, created_at, updated_at
      ) VALUES (
        ${refundId}, ${refundNumber}, ${transaction[0].customer_id},
        ${transaction[0].customer_name}, 'refund', 'completed',
        ${transaction[0].branch_id}, ${refundedBy || transaction[0].cashier_id},
        ${transaction[0].cashier_name}, ${-refundAmount}, ${-refundAmount},
        ${transaction[0].payment_method}, ${-refundAmount}, ${reason || null},
        NOW(), NOW()
      ) RETURNING *
    `;

    res.json({
      success: true,
      originalTransaction: transaction[0],
      refundTransaction: refundTransaction[0],
      message: 'Transaction refunded successfully'
    });
  } catch (error: any) {
    console.error('Refund POS transaction error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refund transaction'
    });
  }
};

// Get POS analytics
export const getPOSAnalytics: RequestHandler = async (req, res) => {
  try {
    const { branchId, startDate, endDate, period = '7' } = req.query;

    let dateFilter = `created_at >= NOW() - INTERVAL '${period} days'`;
    const params: any[] = [];
    let paramIndex = 1;

    if (startDate && endDate) {
      dateFilter = `created_at BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
      params.push(startDate, endDate);
      paramIndex += 2;
    }

    let branchFilter = '';
    if (branchId) {
      branchFilter = ` AND branch_id = $${paramIndex}`;
      params.push(branchId);
    }

    // Sales summary
    const salesSummary = await sql(`
      SELECT 
        COUNT(*) as total_transactions,
        COUNT(CASE WHEN type = 'sale' THEN 1 END) as sales_count,
        COUNT(CASE WHEN type = 'refund' THEN 1 END) as refunds_count,
        SUM(CASE WHEN type = 'sale' THEN total_amount ELSE 0 END) as total_sales,
        SUM(CASE WHEN type = 'refund' THEN total_amount ELSE 0 END) as total_refunds,
        AVG(CASE WHEN type = 'sale' THEN total_amount END) as avg_transaction_value
      FROM pos_transactions 
      WHERE ${dateFilter}${branchFilter}
    `, params);

    // Top products
    const topProducts = await sql(`
      SELECT 
        pti.item_name,
        SUM(pti.quantity) as total_quantity,
        SUM(pti.final_price) as total_revenue,
        COUNT(DISTINCT pti.transaction_id) as transaction_count
      FROM pos_transaction_items pti
      JOIN pos_transactions pt ON pti.transaction_id = pt.id
      WHERE pt.${dateFilter} AND pt.type = 'sale'${branchFilter}
      GROUP BY pti.item_name
      ORDER BY total_revenue DESC
      LIMIT 10
    `, params);

    // Payment methods
    const paymentMethods = await sql(`
      SELECT 
        payment_method,
        COUNT(*) as transaction_count,
        SUM(total_amount) as total_amount
      FROM pos_transactions 
      WHERE ${dateFilter} AND type = 'sale'${branchFilter}
      GROUP BY payment_method
      ORDER BY total_amount DESC
    `, params);

    // Daily sales (last 7 days)
    const dailySales = await sql(`
      SELECT 
        DATE(created_at) as sale_date,
        COUNT(*) as transaction_count,
        SUM(total_amount) as daily_total
      FROM pos_transactions 
      WHERE ${dateFilter} AND type = 'sale'${branchFilter}
      GROUP BY DATE(created_at)
      ORDER BY sale_date DESC
      LIMIT 7
    `, params);

    res.json({
      success: true,
      analytics: {
        summary: salesSummary[0] || {},
        topProducts: topProducts || [],
        paymentMethods: paymentMethods || [],
        dailySales: dailySales || [],
        period: period
      }
    });
  } catch (error: any) {
    console.error('Get POS analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch POS analytics'
    });
  }
};

export default router;
