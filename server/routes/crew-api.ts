import { RequestHandler } from "express";
import { neonDbService } from "../services/neonDatabaseService";
import * as schema from "../database/schema";
import { count, eq, and, sql, desc, avg, gte, lte } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { seedCrewData } from "../database/seed-crew";

// Get comprehensive crew statistics
export const getCrewStats: RequestHandler = async (req, res) => {
  try {
    if (!neonDbService.db) {
      return res.status(500).json({
        success: false,
        error: "Database connection not available"
      });
    }

    const db = neonDbService.db;

    // Get total crew count
    const [totalCrewResult] = await db
      .select({ count: count() })
      .from(schema.users)
      .where(eq(schema.users.role, "crew"));

    // Get crew by status
    const [onlineCrewResult] = await db
      .select({ count: count() })
      .from(schema.crewStatus)
      .where(
        and(
          eq(schema.crewStatus.status, "online"),
          sql`${schema.crewStatus.endedAt} IS NULL`
        )
      );

    const [busyCrewResult] = await db
      .select({ count: count() })
      .from(schema.crewStatus)
      .where(
        and(
          eq(schema.crewStatus.status, "busy"),
          sql`${schema.crewStatus.endedAt} IS NULL`
        )
      );

    const [availableCrewResult] = await db
      .select({ count: count() })
      .from(schema.crewStatus)
      .where(
        and(
          eq(schema.crewStatus.status, "available"),
          sql`${schema.crewStatus.endedAt} IS NULL`
        )
      );

    // Get total groups
    const [totalGroupsResult] = await db
      .select({ count: count() })
      .from(schema.crewGroups)
      .where(eq(schema.crewGroups.status, "active"));

    // Get active groups (with online/busy members)
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
          )`
        )
      );

    // Get average crew rating
    const [avgRatingResult] = await db
      .select({ 
        avgRating: avg(schema.users.crewRating)
      })
      .from(schema.users)
      .where(
        and(
          eq(schema.users.role, "crew"),
          sql`${schema.users.crewRating} IS NOT NULL`
        )
      );

    // Get today's completed bookings
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
          sql`${schema.bookings.completedAt} < ${tomorrow}`
        )
      );

    // Calculate today's revenue from completed bookings
    const [todayRevenueResult] = await db
      .select({ 
        revenue: sql<number>`COALESCE(SUM(${schema.bookings.totalPrice}), 0)`
      })
      .from(schema.bookings)
      .where(
        and(
          eq(schema.bookings.status, "completed"),
          gte(schema.bookings.completedAt, today),
          sql`${schema.bookings.completedAt} < ${tomorrow}`
        )
      );

    const totalCrew = totalCrewResult.count;
    const onlineCrew = onlineCrewResult.count;
    const busyCrew = busyCrewResult.count;
    const availableCrew = availableCrewResult.count;
    const offlineCrew = totalCrew - onlineCrew - busyCrew - availableCrew;

    const stats = {
      totalCrew,
      onlineCrew,
      busyCrew,
      availableCrew,
      offlineCrew,
      totalGroups: totalGroupsResult.count,
      activeGroups: activeGroupsResult.count,
      unassignedCrew: totalCrew - onlineCrew - busyCrew - availableCrew,
      avgRating: avgRatingResult.avgRating ? parseFloat(String(avgRatingResult.avgRating)) : 0,
      todayJobs: todayJobsResult.count,
      todayRevenue: Number(todayRevenueResult.revenue) || 0
    };

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error("Error fetching crew stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch crew statistics"
    });
  }
};

// Get recent crew activity
export const getCrewActivity: RequestHandler = async (req, res) => {
  try {
    if (!neonDbService.db) {
      return res.status(500).json({
        success: false,
        error: "Database connection not available"
      });
    }

    const db = neonDbService.db;
    const limit = parseInt(req.query.limit as string) || 10;

    // Get recent status changes
    const recentStatusChanges = await db
      .select({
        id: schema.crewStatus.id,
        crewId: schema.crewStatus.crewId,
        status: schema.crewStatus.status,
        startedAt: schema.crewStatus.startedAt,
        crewName: schema.users.fullName,
        type: sql<string>`'status_change'`
      })
      .from(schema.crewStatus)
      .innerJoin(schema.crewMembers, eq(schema.crewStatus.crewId, schema.crewMembers.id))
      .innerJoin(schema.users, eq(schema.crewMembers.userId, schema.users.id))
      .orderBy(desc(schema.crewStatus.startedAt))
      .limit(limit);

    // Transform to activity format
    const activities = recentStatusChanges.map(change => ({
      id: change.id,
      type: 'status_change' as const,
      crewId: change.crewId,
      crewName: change.crewName,
      message: `Changed status to ${change.status}`,
      timestamp: change.startedAt.toISOString(),
      severity: change.status === 'offline' ? 'warning' : 'info'
    }));

    res.json({
      success: true,
      activities
    });

  } catch (error) {
    console.error("Error fetching crew activity:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch crew activity"
    });
  }
};

// Get crew list with details
export const getCrewList: RequestHandler = async (req, res) => {
  try {
    if (!neonDbService.db) {
      return res.status(500).json({
        success: false,
        error: "Database connection not available"
      });
    }

    const db = neonDbService.db;

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
        currentStatus: schema.crewStatus.status
      })
      .from(schema.users)
      .leftJoin(schema.crewMembers, eq(schema.users.id, schema.crewMembers.userId))
      .leftJoin(schema.crewStatus, 
        and(
          eq(schema.crewMembers.id, schema.crewStatus.crewId),
          sql`${schema.crewStatus.endedAt} IS NULL`
        )
      )
      .where(eq(schema.users.role, "crew"));

    res.json({
      success: true,
      crew: crewList
    });

  } catch (error) {
    console.error("Error fetching crew list:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch crew list"
    });
  }
};

// Get crew groups
export const getCrewGroups: RequestHandler = async (req, res) => {
  try {
    if (!neonDbService.db) {
      return res.status(500).json({
        success: false,
        error: "Database connection not available"
      });
    }

    const db = neonDbService.db;

    const groups = await db
      .select({
        id: schema.crewGroups.id,
        name: schema.crewGroups.name,
        description: schema.crewGroups.description,
        leaderId: schema.crewGroups.leaderId,
        color: schema.crewGroups.color,
        status: schema.crewGroups.status,
        createdAt: schema.crewGroups.createdAt,
        leaderName: schema.users.fullName
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
            status: schema.crewStatus.status
          })
          .from(schema.crewMembers)
          .innerJoin(schema.users, eq(schema.crewMembers.userId, schema.users.id))
          .leftJoin(schema.crewStatus, 
            and(
              eq(schema.crewMembers.id, schema.crewStatus.crewId),
              sql`${schema.crewStatus.endedAt} IS NULL`
            )
          )
          .where(eq(schema.crewMembers.crewGroupId, group.id));

        return {
          ...group,
          members
        };
      })
    );

    res.json({
      success: true,
      groups: groupsWithMembers
    });

  } catch (error) {
    console.error("Error fetching crew groups:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch crew groups"
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
    if (!neonDbService.db) {
      return res.status(500).json({
        success: false,
        error: "Database connection not available",
      });
    }

    const db = neonDbService.db;
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

    if (!neonDbService.db) {
      return res.status(500).json({
        success: false,
        error: "Database connection not available",
      });
    }

    const db = neonDbService.db;
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

    if (!neonDbService.db) {
      return res.status(500).json({
        success: false,
        error: "Database connection not available",
      });
    }

    const db = neonDbService.db;
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
          sql`COALESCE(${schema.bookings.assignedCrew}, '[]'::jsonb) @> ${JSON.stringify([
            userId,
          ])}::jsonb`,
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

export const getCrewCommissionSummary: RequestHandler = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!neonDbService.db) {
      return res.status(500).json({
        success: false,
        error: "Database connection not available",
      });
    }

    const db = neonDbService.db;
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

    const crewProfiles = await db
      .select({
        userId: schema.crewMembers.userId,
        fullName: schema.users.fullName,
        commissionRate: schema.crewMembers.commissionRate,
      })
      .from(schema.crewMembers)
      .innerJoin(schema.users, eq(schema.crewMembers.userId, schema.users.id))
      .where(eq(schema.users.role, "crew"));

    const crewProfileMap = new Map(
      crewProfiles.map((profile) => [profile.userId, profile]),
    );

    const bookings = await db
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

    bookings.forEach((booking) => {
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
            crewName: profile?.fullName || "Unknown Crew",
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
      });
    });

    res.json({
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
    });
  } catch (error) {
    console.error("Error fetching crew commission summary:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch crew commission summary",
    });
  }
};

// Seed crew data (for development/testing)
export const seedCrew: RequestHandler = async (req, res) => {
  try {
    await seedCrewData();

    res.json({
      success: true,
      message: "Crew data seeded successfully"
    });

  } catch (error) {
    console.error("Error seeding crew data:", error);
    res.status(500).json({
      success: false,
      error: "Failed to seed crew data"
    });
  }
};
