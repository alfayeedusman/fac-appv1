import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure } from "../trpc/trpc";
import { supabaseDbService } from "../services/supabaseDatabaseService";

const isUnreadByUser = (notification: any, userId: string) => {
  const readBy = notification?.readBy || [];
  return !readBy.some((entry: any) => entry.userId === userId);
};

export const notificationsRouter = router({
  list: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        role: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      try {
        const notifications = await supabaseDbService.getNotificationsForUser(
          input.userId,
          input.role || "user",
        );

        return { notifications };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch notifications",
        });
      }
    }),

  getUnreadCount: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        role: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      const notifications = await supabaseDbService.getNotificationsForUser(
        input.userId,
        input.role || "user",
      );

      const unreadCount = notifications.filter((notification: any) =>
        isUnreadByUser(notification, input.userId),
      ).length;

      return { unreadCount };
    }),

  markAsRead: publicProcedure
    .input(
      z.object({
        notificationId: z.string(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const notification = await supabaseDbService.markNotificationAsRead(
          input.notificationId,
          input.userId,
        );
        return { notification };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to mark notification as read",
        });
      }
    }),

  markAllAsRead: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        role: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const notifications = await supabaseDbService.getNotificationsForUser(
        input.userId,
        input.role || "user",
      );

      const unread = notifications.filter((notification: any) =>
        isUnreadByUser(notification, input.userId),
      );

      await Promise.all(
        unread.map((notification: any) =>
          supabaseDbService.markNotificationAsRead(
            notification.id,
            input.userId,
          ),
        ),
      );

      return { updatedCount: unread.length };
    }),

  create: publicProcedure
    .input(
      z.object({
        type: z.string(),
        title: z.string(),
        message: z.string(),
        priority: z.string(),
        targetRoles: z.array(z.string()),
        targetUsers: z.array(z.string()).optional(),
        data: z.record(z.any()).optional(),
        scheduledFor: z.string().optional(),
        actions: z.array(
          z.object({
            label: z.string(),
            action: z.string(),
            variant: z.enum(["default", "destructive", "secondary"]).optional(),
          }),
        )
        .optional(),
        playSound: z.boolean().optional(),
        soundType: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const notification = await supabaseDbService.createSystemNotification({
          ...input,
          scheduledFor: input.scheduledFor
            ? new Date(input.scheduledFor)
            : undefined,
        });
        return { notification };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create notification",
        });
      }
    }),
});
