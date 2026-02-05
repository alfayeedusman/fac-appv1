import { RequestHandler } from "express";
import { supabaseDbService } from "../services/supabaseDatabaseService";
import * as schema from "../database/schema";
import { count, eq, and, sql, desc, avg, gte, lte, inArray } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { seedCrewData } from "../database/seed-crew";

const requireDb = async (res: any) => {
  const db = await supabaseDbService.getDb();
  if (!db) {
    res.status(500).json({
      success: false,
      error: "Database connection not available",
    });
    return null;
  }
  return db;
};

// Get comprehensive crew statistics
export const getCrewStats: RequestHandler = async (req, res) => {
  console.log("📊 getCrewStats called");

  // Fallback response
  const fallback = {
    success: true,
    stats: {
      totalCrew: 0,
      unassignedCrew: 0,
      onlineCrew: 0,
      busyCrew: 0,
      availableCrew: 0,
      totalGroups: 0,
      activeGroups: 0,
      averageRating: 0,
      totalBookings: 0,
      completedBookings: 0,
    },
  };

  try {
    const db = await requireDb(res);
    if (!db) {
      console.warn("⚠️ Database not available for crew stats");
      return res.json(fallback);
    }

    // Get total crew count with error handling
    let totalCrewCount = 0;
    try {
      const [totalCrewResult] = await db
        .select({ count: count() })
        .from(schema.users)
        .where(eq(schema.users.role, "crew"));
      totalCrewCount = totalCrewResult?.count || 0;
    } catch (err) {
      console.warn("Error fetching total crew count:", err);
    }

    let unassignedCrewCount = 0;
    try {
      const [unassignedCrewResult] = await db
        .select({ count: count() })
        .from(schema.crewMembers)
        .where(sql`${schema.crewMembers.crewGroupId} IS NULL`);
      unassignedCrewCount = unassignedCrewResult?.count || 0;
    } catch (err) {
      console.warn("Error fetching unassigned crew count:", err);
    }

    // Get crew by status
    let onlineCrewCount = 0;
    try {
      const [onlineCrewResult] = await db
        .select({ count: count() })
        .from(schema.crewStatus)
        .where(
          and(
            eq(schema.crewStatus.status, "online"),
            sql`${schema.crewStatus.endedAt} IS NULL`,
          ),
        );
      onlineCrewCount = onlineCrewResult?.count || 0;
    } catch (err) {
      console.warn("Error fetching online crew count:", err);
    }

    let busyCrewCount = 0;
    try {
      const [busyCrewResult] = await db
        .select({ count: count() })
        .from(schema.crewStatus)
        .where(
          and(
            eq(schema.crewStatus.status, "busy"),
            sql`${schema.crewStatus.endedAt} IS NULL`,
          ),
        );
      busyCrewCount = busyCrewResult?.count || 0;
    } catch (err) {
      console.warn("Error fetching busy crew count:", err);
    }

    let availableCrewCount = 0;
    try {
      const [availableCrewResult] = await db
        .select({ count: count() })
        .from(schema.crewStatus)
        .where(
          and(
            eq(schema.crewStatus.status, "available"),
            sql`${schema.crewStatus.endedAt} IS NULL`,
          ),
        );
      availableCrewCount = availableCrewResult?.count || 0;
    } catch (err) {
      console.warn("Error fetching available crew count:", err);
    }

    // Get total groups
    let totalGroupsCount = 0;
    try {
      const [totalGroupsResult] = await db
        .select({ count: count() })
        .from(schema.crewGroups)
        .where(eq(schema.crewGroups.status, "active"));
      totalGroupsCount = totalGroupsResult?.count || 0;
    } catch (err) {
      console.warn("Error fetching total groups count:", err);
    }

    // Get active groups
    let activeGroupsCount = 0;
    try {
      const [activeGroupsResult] = await db
        .select({ count: count() })
        .from(schema.crewGroups)
        .where(
          and(
            eq(schema.crewGroups.status, "active"),
            sql`EXISTS (
              SELECT 1 FROM ${schema.crewMembers} cm
              JOIN ${schema.crewStatus} cs ON cm.id = cs.crew_id
              WHERE cm.crew_group_id = ${schema.crewGroups.id}
              AND cs.status IN ('online', 'busy')
              AND cs.ended_at IS NULL
            )`,
          ),
        );
      activeGroupsCount = activeGroupsResult?.count || 0;
    } catch (err) {
      console.warn("Error fetching active groups count:", err);
    }

    // Get average crew rating
    let avgRating = 0;
    try {
      const [avgRatingResult] = await db
        .select({
          avgRating: avg(schema.users.crewRating),
        })
        .from(schema.users)
        .where(
          and(
            eq(schema.users.role, "crew"),
            sql`${schema.users.crewRating} IS NOT NULL`,
          ),
        );
      avgRating = avgRatingResult?.avgRating
        ? parseFloat(String(avgRatingResult.avgRating))
        : 0;
    } catch (err) {
      console.warn("Error fetching average crew rating:", err);
    }

    // Get today's completed bookings
    let todayJobsCount = 0;
    let todayRevenue = 0;
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const [todayJobsResult] = await db
        .select({ count: count() })
        .from(schema.bookings)
        .where(
          and(
            eq(schema.bookings.status, "completed"),
            gte(schema.bookings.completedAt, today),
            sql`${schema.bookings.completedAt} < ${tomorrow}`,
          ),
        );
      todayJobsCount = todayJobsResult?.count || 0;

      // Calculate today's revenue
      const [todayRevenueResult] = await db
        .select({
          revenue: sql<number>`COALESCE(SUM(${schema.bookings.totalPrice}), 0)`,
        })
        .from(schema.bookings)
        .where(
          and(
            eq(schema.bookings.status, "completed"),
            gte(schema.bookings.completedAt, today),
            sql`${schema.bookings.completedAt} < ${tomorrow}`,
          ),
        );
      todayRevenue = Number(todayRevenueResult?.revenue) || 0;
    } catch (err) {
      console.warn("Error fetching today's jobs and revenue:", err);
    }

    const stats = {
      totalCrew: totalCrewCount,
      onlineCrew: onlineCrewCount,
      busyCrew: busyCrewCount,
      availableCrew: availableCrewCount,
      offlineCrew: Math.max(0, totalCrewCount - onlineCrewCount - busyCrewCount - availableCrewCount),
      totalGroups: totalGroupsCount,
      activeGroups: activeGroupsCount,
      unassignedCrew: unassignedCrewCount,
      avgRating,
      todayJobs: todayJobsCount,
      todayRevenue,
    };

    console.log("✅ Successfully retrieved crew stats");
    return res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Error in crew stats endpoint:", error);
    return res.json(fallback);
  }
};

// Get recent crew activity
export const getCrewActivity: RequestHandler = async (req, res) => {
  try {
    const db = await requireDb(res);
    if (!db) return;
    const limit = parseInt(req.query.limit as string) || 10;

    // Get recent status changes
    const recentStatusChanges = await db
      .select({
        id: schema.crewStatus.id,
        crewId: schema.crewStatus.crewId,
        status: schema.crewStatus.status,
        startedAt: schema.crewStatus.startedAt,
        crewName: schema.users.fullName,
        type: sql<string>`'status_change'`,
      })
      .from(schema.crewStatus)
      .innerJoin(
        schema.crewMembers,
        eq(schema.crewStatus.crewId, schema.crewMembers.id),
      )
      .innerJoin(schema.users, eq(schema.crewMembers.userId, schema.users.id))
      .orderBy(desc(schema.crewStatus.startedAt))
      .limit(limit);

    // Transform to activity format
    const activities = recentStatusChanges.map((change) => ({
      id: change.id,
      type: "status_change" as const,
      crewId: change.crewId,
      crewName: change.crewName,
      message: `Changed status to ${change.status}`,
      timestamp: change.startedAt.toISOString(),
      severity: change.status === "offline" ? "warning" : "info",
    }));

    res.json({
      success: true,
      activities,
    });
  } catch (error) {
    console.error("Error fetching crew activity:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch crew activity",
    });
  }
};

// Get crew list with details
export const getCrewList: RequestHandler = async (req, res) => {
  try {
    const db = await requireDb(res);
    if (!db) return;

    const crewList = await db
      .select({
        id: schema.users.id,
        fullName: schema.users.fullName,
        email: schema.users.email,
        contactNumber: schema.users.contactNumber,
        branchLocation: schema.users.branchLocation,
        crewRating: schema.users.crewRating,
        crewExperience: schema.users.crewExperience,
        crewSkills: schema.users.crewSkills,
        isActive: schema.users.isActive,
        lastLoginAt: schema.users.lastLoginAt,
        crewMemberId: schema.crewMembers.id,
        employeeId: schema.crewMembers.employeeId,
        groupId: schema.crewMembers.crewGroupId,
        commissionRate: schema.crewMembers.commissionRate,
        washBay: schema.crewMembers.washBay,
        currentStatus: schema.crewStatus.status,
      })
      .from(schema.users)
      .leftJoin(
        schema.crewMembers,
        eq(schema.users.id, schema.crewMembers.userId),
      )
      .leftJoin(
        schema.crewStatus,
        and(
          eq(schema.crewMembers.id, schema.crewStatus.crewId),
          sql`${schema.crewStatus.endedAt} IS NULL`,
        ),
      )
      .where(eq(schema.users.role, "crew"));

    res.json({
      success: true,
      crew: crewList,
    });
  } catch (error) {
    console.error("Error fetching crew list:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch crew list",
    });
  }
};

// Get crew groups
export const getCrewGroups: RequestHandler = async (req, res) => {
  try {
    if (!supabaseDbService.db) {
      return res.status(500).json({
        success: false,
        error: "Database connection not available",
      });
    }

    const db = supabaseDbService.db;

    const groups = await db
      .select({
        id: schema.crewGroups.id,
        name: schema.crewGroups.name,
        description: schema.crewGroups.description,
        leaderId: schema.crewGroups.leaderId,
        color: schema.crewGroups.colorCode,
        status: schema.crewGroups.status,
        createdAt: schema.crewGroups.createdAt,
        leaderName: schema.users.fullName,
      })
      .from(schema.crewGroups)
      .leftJoin(schema.users, eq(schema.crewGroups.leaderId, schema.users.id))
      .where(eq(schema.crewGroups.status, "active"));

    // Get members for each group
    const groupsWithMembers = await Promise.all(
      groups.map(async (group) => {
        const members = await db
          .select({
            id: schema.crewMembers.id,
            userId: schema.crewMembers.userId,
            employeeId: schema.crewMembers.employeeId,
            fullName: schema.users.fullName,
            status: schema.crewStatus.status,
          })
          .from(schema.crewMembers)
          .innerJoin(
            schema.users,
            eq(schema.crewMembers.userId, schema.users.id),
          )
          .leftJoin(
            schema.crewStatus,
            and(
              eq(schema.crewMembers.id, schema.crewStatus.crewId),
              sql`${schema.crewStatus.endedAt} IS NULL`,
            ),
          )
          .where(eq(schema.crewMembers.crewGroupId, group.id));

        return {
          ...group,
          members,
        };
      }),
    );

    res.json({
      success: true,
      groups: groupsWithMembers,
    });
  } catch (error) {
    console.error("Error fetching crew groups:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch crew groups",
    });
  }
};

export const updateCrewGroupAssignment: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const { groupId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "userId is required",
      });
    }

    const db = await requireDb(res);
    if (!db) return;

    const [updated] = await db
      .update(schema.crewMembers)
      .set({
        crewGroupId: groupId || null,
        updatedAt: new Date(),
      })
      .where(eq(schema.crewMembers.userId, userId))
      .returning();

    res.json({ success: true, crewMember: updated });
  } catch (error) {
    console.error("Error updating crew group assignment:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update crew group assignment",
    });
  }
};

export const updateCrewWashBayAssignment: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const { washBay } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "userId is required",
      });
    }

    const db = await requireDb(res);
    if (!db) return;

    const [updated] = await db
      .update(schema.crewMembers)
      .set({
        washBay: washBay || null,
        updatedAt: new Date(),
      })
      .where(eq(schema.crewMembers.userId, userId))
      .returning();

    res.json({ success: true, crewMember: updated });
  } catch (error) {
    console.error("Error updating crew wash bay assignment:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update crew wash bay assignment",
    });
  }
};

const getPayrollWindow = (referenceDate: Date) => {
  const start = new Date(referenceDate);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay()); // Sunday

  const end = new Date(start);
  end.setDate(end.getDate() + 5); // Friday
  end.setHours(23, 59, 59, 999);

  const payoutDate = new Date(start);
  payoutDate.setDate(payoutDate.getDate() + 6); // Saturday
  payoutDate.setHours(9, 0, 0, 0);

  return { start, end, payoutDate };
};

export const getCommissionRates: RequestHandler = async (req, res) => {
  try {
    if (!supabaseDbService.db) {
      return res.status(500).json({
        success: false,
        error: "Database connection not available",
      });
    }

    const db = supabaseDbService.db;
    const rates = await db
      .select()
      .from(schema.crewCommissionRates)
      .where(eq(schema.crewCommissionRates.isActive, true))
      .orderBy(desc(schema.crewCommissionRates.updatedAt));

    res.json({ success: true, rates });
  } catch (error) {
    console.error("Error fetching commission rates:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch commission rates",
    });
  }
};

export const upsertCommissionRate: RequestHandler = async (req, res) => {
  try {
    const { serviceType, rate } = req.body;
    if (!serviceType || rate === undefined || rate === null) {
      return res.status(400).json({
        success: false,
        error: "serviceType and rate are required",
      });
    }

    if (!supabaseDbService.db) {
      return res.status(500).json({
        success: false,
        error: "Database connection not available",
      });
    }

    const db = supabaseDbService.db;
    const [existing] = await db
      .select()
      .from(schema.crewCommissionRates)
      .where(eq(schema.crewCommissionRates.serviceType, serviceType));

    if (existing) {
      const [updated] = await db
        .update(schema.crewCommissionRates)
        .set({ rate: String(rate), updatedAt: new Date() })
        .where(eq(schema.crewCommissionRates.id, existing.id))
        .returning();
      return res.json({ success: true, rate: updated });
    }

    const [created] = await db
      .insert(schema.crewCommissionRates)
      .values({
        id: createId(),
        serviceType,
        rate: String(rate),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return res.json({ success: true, rate: created });
  } catch (error) {
    console.error("Error saving commission rate:", error);
    res.status(500).json({
      success: false,
      error: "Failed to save commission rate",
    });
  }
};

export const getCrewPayroll: RequestHandler = async (req, res) => {
  try {
    const { userId, startDate, endDate } = req.query;
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "userId is required",
      });
    }

    if (!supabaseDbService.db) {
      return res.status(500).json({
        success: false,
        error: "Database connection not available",
      });
    }

    const db = supabaseDbService.db;
    const referenceDate = new Date();
    const window = getPayrollWindow(referenceDate);

    const start = startDate ? new Date(startDate as string) : window.start;
    const end = endDate ? new Date(endDate as string) : window.end;

    const commissionRates = await db
      .select()
      .from(schema.crewCommissionRates)
      .where(eq(schema.crewCommissionRates.isActive, true));

    const rateMap = new Map<string, number>();
    commissionRates.forEach((rate) => {
      rateMap.set(rate.serviceType.toLowerCase(), Number(rate.rate) || 0);
    });

    const [crewMember] = await db
      .select({ commissionRate: schema.crewMembers.commissionRate })
      .from(schema.crewMembers)
      .where(eq(schema.crewMembers.userId, userId as string));

    const fallbackRate = Number(crewMember?.commissionRate || 0);

    const bookings = await db
      .select({
        id: schema.bookings.id,
        service: schema.bookings.service,
        category: schema.bookings.category,
        totalPrice: schema.bookings.totalPrice,
        completedAt: schema.bookings.completedAt,
      })
      .from(schema.bookings)
      .where(
        and(
          eq(schema.bookings.status, "completed"),
          gte(schema.bookings.completedAt, start),
          lte(schema.bookings.completedAt, end),
          sql`COALESCE(${schema.bookings.assignedCrew}, '[]'::jsonb) @> ${JSON.stringify(
            [userId],
          )}::jsonb`,
        ),
      );

    let totalCommission = 0;
    let totalRevenue = 0;

    const breakdown: Record<
      string,
      {
        serviceType: string;
        bookingCount: number;
        totalRevenue: number;
        rate: number;
        commission: number;
      }
    > = {};

    bookings.forEach((booking) => {
      const serviceKey =
        booking.service || booking.category || "Unspecified Service";
      const normalizedKey = serviceKey.toLowerCase();
      const rate =
        rateMap.get(normalizedKey) ||
        rateMap.get((booking.category || "").toLowerCase()) ||
        fallbackRate;
      const revenue = Number(booking.totalPrice) || 0;
      const commission = (revenue * rate) / 100;

      totalCommission += commission;
      totalRevenue += revenue;

      if (!breakdown[serviceKey]) {
        breakdown[serviceKey] = {
          serviceType: serviceKey,
          bookingCount: 0,
          totalRevenue: 0,
          rate,
          commission: 0,
        };
      }

      breakdown[serviceKey].bookingCount += 1;
      breakdown[serviceKey].totalRevenue += revenue;
      breakdown[serviceKey].commission += commission;
    });

    res.json({
      success: true,
      payroll: {
        period: {
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          payoutDate: window.payoutDate.toISOString(),
        },
        totalBookings: bookings.length,
        totalRevenue,
        totalCommission,
        breakdown: Object.values(breakdown),
      },
    });
  } catch (error) {
    console.error("Error fetching crew payroll:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch crew payroll",
    });
  }
};

const COMMISSION_STATUSES = [
  "pending",
  "approved",
  "released",
  "disputed",
] as const;

type CommissionStatus = (typeof COMMISSION_STATUSES)[number];

export const getCommissionEntries: RequestHandler = async (req, res) => {
  try {
    if (!supabaseDbService.db) {
      return res.status(500).json({
        success: false,
        error: "Database connection not available",
      });
    }

    const { crewUserId, startDate, endDate, status } = req.query;
    const db = supabaseDbService.db;

    const conditions = [] as any[];
    if (crewUserId) {
      conditions.push(
        eq(schema.crewCommissionEntries.crewUserId, crewUserId as string),
      );
    }
    if (status) {
      conditions.push(
        eq(schema.crewCommissionEntries.status, status as string),
      );
    }
    if (startDate) {
      conditions.push(
        gte(
          schema.crewCommissionEntries.entryDate,
          new Date(startDate as string),
        ),
      );
    }
    if (endDate) {
      conditions.push(
        lte(
          schema.crewCommissionEntries.entryDate,
          new Date(endDate as string),
        ),
      );
    }

    let query = db
      .select({
        id: schema.crewCommissionEntries.id,
        crewUserId: schema.crewCommissionEntries.crewUserId,
        entryDate: schema.crewCommissionEntries.entryDate,
        amount: schema.crewCommissionEntries.amount,
        notes: schema.crewCommissionEntries.notes,
        recordedBy: schema.crewCommissionEntries.recordedBy,
        status: schema.crewCommissionEntries.status,
        payoutId: schema.crewCommissionEntries.payoutId,
        createdAt: schema.crewCommissionEntries.createdAt,
        updatedAt: schema.crewCommissionEntries.updatedAt,
        crewName: schema.users.fullName,
      })
      .from(schema.crewCommissionEntries)
      .leftJoin(
        schema.users,
        eq(schema.crewCommissionEntries.crewUserId, schema.users.id),
      )
      .orderBy(desc(schema.crewCommissionEntries.entryDate));

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }

    const entries = await query;
    res.json({ success: true, entries });
  } catch (error) {
    console.error("Error fetching commission entries:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch commission entries",
    });
  }
};

export const createCommissionEntry: RequestHandler = async (req, res) => {
  try {
    const { crewUserId, entryDate, amount, notes, recordedBy, status } =
      req.body;

    if (
      !crewUserId ||
      !entryDate ||
      amount === undefined ||
      amount === null ||
      !recordedBy
    ) {
      return res.status(400).json({
        success: false,
        error: "crewUserId, entryDate, amount, and recordedBy are required",
      });
    }

    if (!supabaseDbService.db) {
      return res.status(500).json({
        success: false,
        error: "Database connection not available",
      });
    }

    const entryStatus: CommissionStatus = COMMISSION_STATUSES.includes(status)
      ? status
      : "pending";

    const db = supabaseDbService.db;
    const [created] = await db
      .insert(schema.crewCommissionEntries)
      .values({
        id: createId(),
        crewUserId,
        entryDate: new Date(entryDate),
        amount: String(amount),
        notes: notes || null,
        recordedBy,
        status: entryStatus,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    res.json({ success: true, entry: created });
  } catch (error) {
    console.error("Error creating commission entry:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create commission entry",
    });
  }
};

export const updateCommissionEntryStatus: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || !status) {
      return res.status(400).json({
        success: false,
        error: "id and status are required",
      });
    }

    if (!COMMISSION_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status",
      });
    }

    if (!supabaseDbService.db) {
      return res.status(500).json({
        success: false,
        error: "Database connection not available",
      });
    }

    const db = supabaseDbService.db;
    const [updated] = await db
      .update(schema.crewCommissionEntries)
      .set({ status, updatedAt: new Date() })
      .where(eq(schema.crewCommissionEntries.id, id))
      .returning();

    res.json({ success: true, entry: updated });
  } catch (error) {
    console.error("Error updating commission entry status:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update commission entry status",
    });
  }
};

export const getCrewPayouts: RequestHandler = async (req, res) => {
  try {
    if (!supabaseDbService.db) {
      return res.status(500).json({
        success: false,
        error: "Database connection not available",
      });
    }

    const { crewUserId } = req.query;
    const db = supabaseDbService.db;

    let query = db
      .select({
        id: schema.crewPayouts.id,
        crewUserId: schema.crewPayouts.crewUserId,
        periodStart: schema.crewPayouts.periodStart,
        periodEnd: schema.crewPayouts.periodEnd,
        totalAmount: schema.crewPayouts.totalAmount,
        status: schema.crewPayouts.status,
        createdBy: schema.crewPayouts.createdBy,
        releasedAt: schema.crewPayouts.releasedAt,
        createdAt: schema.crewPayouts.createdAt,
        updatedAt: schema.crewPayouts.updatedAt,
        crewName: schema.users.fullName,
      })
      .from(schema.crewPayouts)
      .leftJoin(
        schema.users,
        eq(schema.crewPayouts.crewUserId, schema.users.id),
      )
      .orderBy(desc(schema.crewPayouts.periodEnd));

    if (crewUserId) {
      query = query.where(
        eq(schema.crewPayouts.crewUserId, crewUserId as string),
      ) as typeof query;
    }

    const payouts = await query;
    res.json({ success: true, payouts });
  } catch (error) {
    console.error("Error fetching crew payouts:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch crew payouts",
    });
  }
};

export const createCrewPayout: RequestHandler = async (req, res) => {
  try {
    const {
      crewUserId,
      periodStart,
      periodEnd,
      totalAmount,
      status,
      createdBy,
      entryIds,
    } = req.body;

    if (
      !crewUserId ||
      !periodStart ||
      !periodEnd ||
      totalAmount === undefined ||
      !createdBy
    ) {
      return res.status(400).json({
        success: false,
        error:
          "crewUserId, periodStart, periodEnd, totalAmount, and createdBy are required",
      });
    }

    if (!supabaseDbService.db) {
      return res.status(500).json({
        success: false,
        error: "Database connection not available",
      });
    }

    const payoutStatus: CommissionStatus = COMMISSION_STATUSES.includes(status)
      ? status
      : "pending";

    const db = supabaseDbService.db;
    const [created] = await db
      .insert(schema.crewPayouts)
      .values({
        id: createId(),
        crewUserId,
        periodStart: new Date(periodStart),
        periodEnd: new Date(periodEnd),
        totalAmount: String(totalAmount),
        status: payoutStatus,
        createdBy,
        releasedAt: payoutStatus === "released" ? new Date() : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    if (Array.isArray(entryIds) && entryIds.length > 0) {
      await db
        .update(schema.crewCommissionEntries)
        .set({
          payoutId: created.id,
          status: payoutStatus,
          updatedAt: new Date(),
        })
        .where(inArray(schema.crewCommissionEntries.id, entryIds));
    }

    res.json({ success: true, payout: created });
  } catch (error) {
    console.error("Error creating crew payout:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create crew payout",
    });
  }
};

export const updateCrewPayoutStatus: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || !status) {
      return res.status(400).json({
        success: false,
        error: "id and status are required",
      });
    }

    if (!COMMISSION_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status",
      });
    }

    if (!supabaseDbService.db) {
      return res.status(500).json({
        success: false,
        error: "Database connection not available",
      });
    }

    const db = supabaseDbService.db;
    const [updated] = await db
      .update(schema.crewPayouts)
      .set({
        status,
        releasedAt: status === "released" ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(schema.crewPayouts.id, id))
      .returning();

    res.json({ success: true, payout: updated });
  } catch (error) {
    console.error("Error updating crew payout status:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update crew payout status",
    });
  }
};

export const getCrewCommissionSummary: RequestHandler = async (req, res) => {
  const now = new Date();
  const defaultFallback = {
    success: true,
    summary: {
      period: {
        startDate: now.toISOString(),
        endDate: now.toISOString(),
      },
      totalBookings: 0,
      totalRevenue: 0,
      totalCommission: 0,
      crewCount: 0,
      crew: [],
      breakdown: [],
    },
  };

  try {
    res.setHeader("Content-Type", "application/json");

    const { startDate, endDate } = req.query;
    const db = await requireDb(res);
    if (!db) {
      return res.json(defaultFallback);
    }

    let start = startDate ? new Date(startDate as string) : now;
    let end = endDate ? new Date(endDate as string) : now;

    try {
      const referenceDate = new Date();
      const window = getPayrollWindow(referenceDate);
      start = startDate ? new Date(startDate as string) : window.start;
      end = endDate ? new Date(endDate as string) : window.end;
      console.log("📅 Processing date range:", start.toISOString(), "to", end.toISOString());
    } catch (dateError) {
      console.warn("Error parsing dates for commission summary:", dateError);
      start = now;
      end = now;
    }

    let commissionRates: any[] = [];
    try {
      commissionRates = await db
        .select()
        .from(schema.crewCommissionRates)
        .where(eq(schema.crewCommissionRates.isActive, true));
    } catch (rateError) {
      console.warn("Error fetching commission rates:", rateError);
      commissionRates = [];
    }

    const rateMap = new Map<string, number>();
    commissionRates.forEach((rate) => {
      rateMap.set(rate.serviceType.toLowerCase(), Number(rate.rate) || 0);
    });

    let crewProfiles: any[] = [];
    try {
      crewProfiles = await db
        .select({
          userId: schema.crewMembers.userId,
          fullName: schema.users.fullName,
          crewName: schema.crewMembers.name,
          commissionRate: schema.crewMembers.commissionRate,
        })
        .from(schema.crewMembers)
        .leftJoin(schema.users, eq(schema.crewMembers.userId, schema.users.id));
    } catch (profileError) {
      console.warn("Error fetching crew profiles:", profileError);
      crewProfiles = [];
    }

    let crewUsers: any[] = [];
    try {
      crewUsers = await db
        .select({
          userId: schema.users.id,
          fullName: schema.users.fullName,
        })
        .from(schema.users)
        .where(eq(schema.users.role, "crew"));
    } catch (userError) {
      console.warn("Error fetching crew users:", userError);
      crewUsers = [];
    }

    const crewProfileMap = new Map<
      string,
      {
        userId: string;
        fullName?: string | null;
        crewName?: string | null;
        commissionRate?: string | number | null;
      }
    >();

    crewProfiles.forEach((profile) => {
      crewProfileMap.set(profile.userId, profile);
    });

    crewUsers.forEach((user) => {
      if (!crewProfileMap.has(user.userId)) {
        crewProfileMap.set(user.userId, user);
      }
    });

    let bookings;
    try {
      bookings = await db
        .select({
          id: schema.bookings.id,
          service: schema.bookings.service,
          category: schema.bookings.category,
          totalPrice: schema.bookings.totalPrice,
          completedAt: schema.bookings.completedAt,
          assignedCrew: schema.bookings.assignedCrew,
        })
        .from(schema.bookings)
        .where(
          and(
            eq(schema.bookings.status, "completed"),
            gte(schema.bookings.completedAt, start),
            lte(schema.bookings.completedAt, end),
          ),
        );
    } catch (selectError: any) {
      // Fallback: try with minimal columns that definitely exist
      try {
        const fallbackBookings = await db
          .select({
            id: schema.bookings.id,
            completedAt: schema.bookings.completedAt,
          })
          .from(schema.bookings)
          .where(
            and(
              eq(schema.bookings.status, "completed"),
              gte(schema.bookings.createdAt, start),
              lte(schema.bookings.createdAt, end),
            ),
          );
        // Map to expected format with empty fields
        bookings = fallbackBookings.map((b: any) => ({
          id: b.id,
          service: "Unknown",
          category: "Unknown",
          totalPrice: 0,
          completedAt: b.completedAt,
          assignedCrew: [],
        }));
      } catch (fallbackError) {
        console.warn("Error fetching crew commission bookings:", fallbackError);
        bookings = [];
      }
    }

    let manualEntries: any[] = [];
    try {
      manualEntries = await db
        .select({
          id: schema.crewCommissionEntries.id,
          crewUserId: schema.crewCommissionEntries.crewUserId,
          amount: schema.crewCommissionEntries.amount,
          entryDate: schema.crewCommissionEntries.entryDate,
          status: schema.crewCommissionEntries.status,
        })
        .from(schema.crewCommissionEntries)
        .where(
          and(
            gte(schema.crewCommissionEntries.entryDate, start),
            lte(schema.crewCommissionEntries.entryDate, end),
            sql`${schema.crewCommissionEntries.status} != 'disputed'`,
          ),
        );
    } catch (entryError) {
      console.warn("Error fetching manual commission entries:", entryError);
      manualEntries = [];
    }

    let totalCommission = 0;
    let totalRevenue = 0;

    const crewSummary: Record<
      string,
      {
        crewId: string;
        crewName: string;
        totalRevenue: number;
        totalCommission: number;
        totalBookings: number;
      }
    > = {};

    const breakdown: Record<
      string,
      {
        serviceType: string;
        bookingCount: number;
        totalRevenue: number;
        totalCommission: number;
      }
    > = {};

    try {
      bookings.forEach((booking) => {
        try {
          const revenue = Number(booking.totalPrice) || 0;
          totalRevenue += revenue;

          const serviceKey =
            booking.service || booking.category || "Unspecified Service";
          const normalizedKey = serviceKey.toLowerCase();

          let assignedCrew: string[] = [];
          if (Array.isArray(booking.assignedCrew)) {
            assignedCrew = booking.assignedCrew as string[];
          } else if (typeof booking.assignedCrew === "string") {
            try {
              assignedCrew = JSON.parse(booking.assignedCrew);
            } catch (e) {
              assignedCrew = [];
            }
          }

          assignedCrew.forEach((crewId) => {
            try {
              const profile = crewProfileMap.get(crewId);
              const fallbackRate = Number(profile?.commissionRate || 0);
              const rate =
                rateMap.get(normalizedKey) ||
                rateMap.get((booking.category || "").toLowerCase()) ||
                fallbackRate;
              const commission = (revenue * rate) / 100;

              totalCommission += commission;

              if (!crewSummary[crewId]) {
                crewSummary[crewId] = {
                  crewId,
                  crewName: profile?.fullName || profile?.crewName || "Unknown Crew",
                  totalRevenue: 0,
                  totalCommission: 0,
                  totalBookings: 0,
                };
              }

              crewSummary[crewId].totalRevenue += revenue;
              crewSummary[crewId].totalCommission += commission;
              crewSummary[crewId].totalBookings += 1;

              if (!breakdown[serviceKey]) {
                breakdown[serviceKey] = {
                  serviceType: serviceKey,
                  bookingCount: 0,
                  totalRevenue: 0,
                  totalCommission: 0,
                };
              }

              breakdown[serviceKey].bookingCount += 1;
              breakdown[serviceKey].totalRevenue += revenue;
              breakdown[serviceKey].totalCommission += commission;
            } catch (crewError) {
              console.warn("Error processing crew commission for crewId:", crewId, crewError);
            }
          });
        } catch (bookingError) {
          console.warn("Error processing booking:", booking.id, bookingError);
        }
      });
    } catch (bookingsError) {
      console.warn("Error processing bookings forEach:", bookingsError);
    }

    try {
      manualEntries.forEach((entry) => {
        try {
          const crewId = entry.crewUserId;
          const amount = Number(entry.amount) || 0;
          totalCommission += amount;

          if (!crewSummary[crewId]) {
            const profile = crewProfileMap.get(crewId);
            crewSummary[crewId] = {
              crewId,
              crewName: profile?.fullName || profile?.crewName || "Unknown Crew",
              totalRevenue: 0,
              totalCommission: 0,
              totalBookings: 0,
            };
          }

          crewSummary[crewId].totalCommission += amount;
        } catch (entryError) {
          console.warn("Error processing manual entry:", entry.id, entryError);
        }
      });
    } catch (entriesError) {
      console.warn("Error processing manualEntries forEach:", entriesError);
    }

    try {
      const responseData = {
        success: true,
        summary: {
          period: {
            startDate: start.toISOString(),
            endDate: end.toISOString(),
          },
          totalBookings: bookings.length,
          totalRevenue,
          totalCommission,
          crewCount: Object.keys(crewSummary).length,
          crew: Object.values(crewSummary).sort(
            (a, b) => b.totalCommission - a.totalCommission,
          ),
          breakdown: Object.values(breakdown),
        },
      };
      console.log("✅ Sending crew commission summary response with", Object.keys(crewSummary).length, "crew members");
      return sendJSON(responseData);
    } catch (responseError) {
      console.error("Error constructing crew commission summary response:", responseError);
      return sendJSON(defaultFallback);
    }
  } catch (error) {
    console.error("Error fetching crew commission summary:", error);
    // Return fallback response with safe dates
    try {
      const fallbackWithDates = {
        ...defaultFallback,
        summary: {
          ...defaultFallback.summary,
          period: {
            startDate: start?.toISOString?.() || now.toISOString(),
            endDate: end?.toISOString?.() || now.toISOString(),
          },
        },
      };
      return sendJSON(fallbackWithDates);
    } catch (fallbackError) {
      console.error("Error in crew commission summary fallback:", fallbackError);
      return sendJSON(defaultFallback);
    }
  }
};

// Seed crew data (for development/testing)
export const seedCrew: RequestHandler = async (req, res) => {
  try {
    await seedCrewData();

    res.json({
      success: true,
      message: "Crew data seeded successfully",
    });
  } catch (error) {
    console.error("Error seeding crew data:", error);
    res.status(500).json({
      success: false,
      error: "Failed to seed crew data",
    });
  }
};
