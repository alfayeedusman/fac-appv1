import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc/trpc";
import { supabaseDbService } from "../services/supabaseDatabaseService";
import { pushNotificationService } from "../services/pushNotificationService";

export const authRouter = router({
  me: protectedProcedure.query(({ ctx }) => ctx.user),

  logout: protectedProcedure.mutation(async ({ ctx }) => {
    if (ctx.session?.sessionToken) {
      await supabaseDbService.deactivateSession(ctx.session.sessionToken);
    }

    return { success: true };
  }),

  registerPushToken: protectedProcedure
    .input(
      z.object({
        token: z.string(),
        deviceType: z.string().optional(),
        browserInfo: z.string().optional(),
        deviceName: z.string().optional(),
        notificationTypes: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const success = await pushNotificationService.registerToken({
        ...input,
        userId: ctx.user?.id,
      });

      return { success };
    }),

  updateProfile: protectedProcedure
    .input(
      z
        .object({
          fullName: z.string().optional(),
          phone: z.string().optional(),
          email: z.string().email().optional(),
          avatarUrl: z.string().url().optional(),
          address: z.string().optional(),
          city: z.string().optional(),
          province: z.string().optional(),
          postalCode: z.string().optional(),
        })
        .strict(),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await supabaseDbService.updateUser(ctx.user.id, input);
      return { success: true, user };
    }),
});
