import { RequestHandler } from "express";
import { neonDbService } from "../services/neonDatabaseService";
import * as schema from "../database/schema";
import { count, eq, and, sql, desc, avg, gte } from "drizzle-orm";
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
