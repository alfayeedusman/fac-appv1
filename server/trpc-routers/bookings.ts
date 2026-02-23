import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure } from "../trpc/trpc";
import { supabaseDbService } from "../services/supabaseDatabaseService";

const bookingInput = z
  .object({
    userId: z.string().optional(),
    guestInfo: z
      .object({
        firstName: z.string(),
        lastName: z.string(),
        email: z.string().email(),
        phone: z.string(),
      })
      .optional(),
    type: z.string(),
    category: z.string(),
    service: z.string(),
    serviceType: z.string().optional(),
    unitType: z.string(),
    unitSize: z.string().optional(),
    plateNumber: z.string().optional(),
    vehicleModel: z.string().optional(),
    date: z.string(),
    timeSlot: z.string(),
    branch: z.string(),
    serviceLocation: z.string().optional(),
    estimatedDuration: z.coerce.number().optional(),
    basePrice: z.coerce.number(),
    totalPrice: z.coerce.number(),
    currency: z.string().optional(),
    paymentMethod: z.string().optional(),
    paymentStatus: z.string().optional(),
    receiptUrl: z.string().optional(),
    status: z.string().optional(),
    notes: z.string().optional(),
    specialRequests: z.string().optional(),
    pointsEarned: z.coerce.number().optional(),
    loyaltyRewardsApplied: z.array(z.string()).optional(),
    assignedCrew: z.array(z.string()).optional(),
    crewNotes: z.string().optional(),
    completedAt: z.string().optional(),
    customerRating: z.coerce.number().optional(),
    customerFeedback: z.string().optional(),
  })
  .passthrough();

const bookingUpdateInput = bookingInput.partial().passthrough();

export const bookingsRouter = router({
  list: publicProcedure
    .input(
      z.object({
        userId: z.string().optional(),
        status: z.string().optional(),
        branch: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      try {
        if (input.userId) {
          return {
            bookings: await supabaseDbService.getBookingsByUserId(input.userId),
          };
        }

        if (input.branch && input.status) {
          return {
            bookings: await supabaseDbService.getBookingsByBranchAndStatus(
              input.branch,
              input.status,
            ),
          };
        }

        if (input.status) {
          return {
            bookings: await supabaseDbService.getBookingsByStatus(input.status),
          };
        }

        if (input.branch) {
          return {
            bookings: await supabaseDbService.getBookingsByBranch(input.branch),
          };
        }

        return { bookings: await supabaseDbService.getAllBookings() };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch bookings",
        });
      }
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const booking = await supabaseDbService.getBookingById(input.id);
      return { booking };
    }),

  create: publicProcedure
    .input(bookingInput)
    .mutation(async ({ input }) => {
      try {
        const booking = await supabaseDbService.createBooking({
          ...input,
          serviceType: input.serviceType || "branch",
          currency: input.currency || "PHP",
        });

        return { booking };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create booking",
        });
      }
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        updates: bookingUpdateInput,
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const booking = await supabaseDbService.updateBooking(
          input.id,
          input.updates,
        );
        return { booking };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update booking",
        });
      }
    }),

  cancel: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const booking = await supabaseDbService.updateBooking(input.id, {
          status: "cancelled",
        });
        return { booking };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to cancel booking",
        });
      }
    }),
});
