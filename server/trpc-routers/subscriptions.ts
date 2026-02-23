import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure } from "../trpc/trpc";
import { supabaseDbService } from "../services/supabaseDatabaseService";

export const subscriptionsRouter = router({
  getCurrent: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      const subscriptions = await supabaseDbService.getSubscriptions({
        status: "active",
        userId: input.userId,
      });

      return { subscription: subscriptions?.[0] || null };
    }),

  getHistory: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      const subscriptions = await supabaseDbService.getSubscriptions({
        userId: input.userId,
      });

      return { subscriptions };
    }),

  create: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        packageId: z.string(),
        finalPrice: z.coerce.number(),
        paymentMethod: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const subscription = await supabaseDbService.createSubscription({
          userId: input.userId,
          packageId: input.packageId,
          status: "pending",
          finalPrice: input.finalPrice,
          paymentMethod: input.paymentMethod || "online",
          autoRenew: true,
        });

        return { subscription };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create subscription",
        });
      }
    }),

  upgrade: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        packageId: z.string(),
        finalPrice: z.coerce.number(),
        paymentMethod: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const subscription = await supabaseDbService.createSubscription({
          userId: input.userId,
          packageId: input.packageId,
          status: "pending",
          finalPrice: input.finalPrice,
          paymentMethod: input.paymentMethod || "online",
          autoRenew: true,
        });

        return { subscription };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to upgrade subscription",
        });
      }
    }),

  renew: publicProcedure
    .input(
      z.object({
        subscriptionId: z.string(),
        status: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const subscription = await supabaseDbService.updateSubscriptionStatus(
          input.subscriptionId,
          input.status || "active",
        );

        if (!subscription) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Subscription not found",
          });
        }

        return { subscription };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to renew subscription",
        });
      }
    }),
});
