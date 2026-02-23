import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure } from "../trpc/trpc";
import { getSqlClient, sql } from "../database/connection";

const ensureSql = async () => {
  const sqlClient = await getSqlClient();
  if (!sqlClient) {
    throw new TRPCError({
      code: "SERVICE_UNAVAILABLE",
      message: "Database unavailable",
    });
  }
  return sqlClient;
};

export const loyaltyRouter = router({
  getProgress: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      await ensureSql();

      const user = await sql`
        SELECT loyalty_points FROM users WHERE id = ${input.userId} LIMIT 1
      `;

      if (!user?.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      const points = user[0].loyalty_points || 0;

      const level = await sql`
        SELECT * FROM customer_levels
        WHERE is_active = true
          AND min_points <= ${points}
          AND (max_points IS NULL OR max_points >= ${points})
        ORDER BY min_points DESC
        LIMIT 1
      `;

      return {
        points,
        currentLevel: level[0] || null,
      };
    }),

  getTransactions: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        limit: z.coerce.number().optional(),
        offset: z.coerce.number().optional(),
      }),
    )
    .query(async ({ input }) => {
      await ensureSql();

      const limit = input.limit ?? 50;
      const offset = input.offset ?? 0;

      const transactions = await sql`
        SELECT * FROM loyalty_transactions
        WHERE user_id = ${input.userId}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;

      const countResult = await sql`
        SELECT COUNT(*) as count FROM loyalty_transactions WHERE user_id = ${
          input.userId
        }
      `;

      return {
        transactions: transactions || [],
        total: Number(countResult[0]?.count || 0),
      };
    }),

  getAchievements: publicProcedure
    .input(
      z.object({
        category: z.string().optional(),
        isActive: z.boolean().optional(),
      }),
    )
    .query(async ({ input }) => {
      const sqlClient = await ensureSql();

      let query = `SELECT * FROM achievements WHERE 1=1`;
      const params: any[] = [];
      let paramIndex = 1;

      if (input.category) {
        query += ` AND category = $${paramIndex}`;
        params.push(input.category);
        paramIndex++;
      }

      if (input.isActive !== undefined) {
        query += ` AND is_active = $${paramIndex}`;
        params.push(input.isActive);
        paramIndex++;
      }

      query += ` ORDER BY category, points_reward DESC`;

      const achievements = await sqlClient(query, params);
      return { achievements: achievements || [] };
    }),

  getRewards: publicProcedure.query(async () => {
    await ensureSql();

    const rewards = await sql`
      SELECT * FROM achievements
      WHERE is_active = true AND category = 'loyalty'
      ORDER BY points_reward DESC
    `;

    return { rewards: rewards || [] };
  }),

  redeemReward: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        rewardId: z.string(),
        points: z.coerce.number(),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      await ensureSql();

      const user = await sql`
        SELECT loyalty_points FROM users WHERE id = ${input.userId} LIMIT 1
      `;

      if (!user?.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      const currentBalance = user[0].loyalty_points || 0;

      if (currentBalance < input.points) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Insufficient loyalty points",
        });
      }

      const newBalance = currentBalance - input.points;

      await sql`
        UPDATE users
        SET loyalty_points = ${newBalance}, updated_at = NOW()
        WHERE id = ${input.userId}
      `;

      const transactionId = `lt_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 9)}`;

      await sql`
        INSERT INTO loyalty_transactions (
          id, user_id, type, amount, description, reference_type, reference_id,
          balance_before, balance_after, created_at
        ) VALUES (
          ${transactionId}, ${input.userId}, 'redeemed', ${input.points},
          ${input.description || 'Reward redemption'}, 'reward', ${input.rewardId},
          ${currentBalance}, ${newBalance}, NOW()
        )
      `;

      return { newBalance };
    }),

  addPoints: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        amount: z.coerce.number(),
        description: z.string().optional(),
        referenceType: z.string().optional(),
        referenceId: z.string().optional(),
        processedBy: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      await ensureSql();

      const user = await sql`
        SELECT loyalty_points FROM users WHERE id = ${input.userId} LIMIT 1
      `;

      if (!user?.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      const currentBalance = user[0].loyalty_points || 0;
      const newBalance = currentBalance + input.amount;

      await sql`
        UPDATE users
        SET loyalty_points = ${newBalance}, updated_at = NOW()
        WHERE id = ${input.userId}
      `;

      const transactionId = `lt_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 9)}`;

      await sql`
        INSERT INTO loyalty_transactions (
          id, user_id, type, amount, description, reference_type, reference_id,
          balance_before, balance_after, processed_by, created_at
        ) VALUES (
          ${transactionId}, ${input.userId}, 'earned', ${input.amount},
          ${input.description || 'Manual points added'},
          ${input.referenceType || 'manual'}, ${input.referenceId || null},
          ${currentBalance}, ${newBalance}, ${input.processedBy || null}, NOW()
        )
      `;

      return { newBalance };
    }),
});
