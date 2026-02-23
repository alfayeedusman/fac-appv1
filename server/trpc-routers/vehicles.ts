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

export const vehiclesRouter = router({
  list: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      await ensureSql();

      try {
        const result = await sql`
          SELECT * FROM user_vehicles
          WHERE user_id = ${input.userId}
          ORDER BY created_at DESC
        `;

        const vehicles = result.map((vehicle: any) => ({
          id: vehicle.id,
          userId: vehicle.user_id,
          unitType: vehicle.unit_type,
          unitSize: vehicle.unit_size,
          plateNumber: vehicle.plate_number,
          vehicleModel: vehicle.vehicle_model,
          isDefault: vehicle.is_default,
          createdAt: vehicle.created_at,
          updatedAt: vehicle.updated_at,
        }));

        return { vehicles };
      } catch (error: any) {
        if (error?.message?.includes("relation \"user_vehicles\" does not exist")) {
          return { vehicles: [] };
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch vehicles",
        });
      }
    }),

  getById: publicProcedure
    .input(z.object({ userId: z.string(), vehicleId: z.string() }))
    .query(async ({ input }) => {
      await ensureSql();

      const result = await sql`
        SELECT * FROM user_vehicles
        WHERE id = ${input.vehicleId} AND user_id = ${input.userId}
        LIMIT 1
      `;

      const vehicle = result[0]
        ? {
            id: result[0].id,
            userId: result[0].user_id,
            unitType: result[0].unit_type,
            unitSize: result[0].unit_size,
            plateNumber: result[0].plate_number,
            vehicleModel: result[0].vehicle_model,
            isDefault: result[0].is_default,
            createdAt: result[0].created_at,
            updatedAt: result[0].updated_at,
          }
        : null;

      return { vehicle };
    }),

  create: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        unitType: z.string(),
        unitSize: z.string().optional(),
        plateNumber: z.string().optional(),
        vehicleModel: z.string().optional(),
        isDefault: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      await ensureSql();

      if (input.isDefault) {
        await sql`
          UPDATE user_vehicles
          SET is_default = false
          WHERE user_id = ${input.userId}
        `;
      }

      const result = await sql`
        INSERT INTO user_vehicles (
          user_id, unit_type, unit_size, plate_number, vehicle_model, is_default
        ) VALUES (
          ${input.userId}, ${input.unitType}, ${input.unitSize || null},
          ${input.plateNumber || null}, ${input.vehicleModel || null},
          ${input.isDefault || false}
        ) RETURNING *
      `;

      const vehicle = result[0]
        ? {
            id: result[0].id,
            userId: result[0].user_id,
            unitType: result[0].unit_type,
            unitSize: result[0].unit_size,
            plateNumber: result[0].plate_number,
            vehicleModel: result[0].vehicle_model,
            isDefault: result[0].is_default,
            createdAt: result[0].created_at,
            updatedAt: result[0].updated_at,
          }
        : null;

      return { vehicle };
    }),

  update: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        vehicleId: z.string(),
        updates: z
          .object({
            unitType: z.string().optional(),
            unitSize: z.string().optional(),
            plateNumber: z.string().optional(),
            vehicleModel: z.string().optional(),
            isDefault: z.boolean().optional(),
          })
          .strict(),
      }),
    )
    .mutation(async ({ input }) => {
      await ensureSql();

      if (input.updates.isDefault) {
        await sql`
          UPDATE user_vehicles
          SET is_default = false
          WHERE user_id = ${input.userId} AND id != ${input.vehicleId}
        `;
      }

      const result = await sql`
        UPDATE user_vehicles
        SET
          unit_type = COALESCE(${input.updates.unitType}, unit_type),
          unit_size = COALESCE(${input.updates.unitSize}, unit_size),
          plate_number = COALESCE(${input.updates.plateNumber}, plate_number),
          vehicle_model = COALESCE(${input.updates.vehicleModel}, vehicle_model),
          is_default = COALESCE(${input.updates.isDefault}, is_default),
          updated_at = NOW()
        WHERE id = ${input.vehicleId} AND user_id = ${input.userId}
        RETURNING *
      `;

      if (!result.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Vehicle not found",
        });
      }

      const vehicle = {
        id: result[0].id,
        userId: result[0].user_id,
        unitType: result[0].unit_type,
        unitSize: result[0].unit_size,
        plateNumber: result[0].plate_number,
        vehicleModel: result[0].vehicle_model,
        isDefault: result[0].is_default,
        createdAt: result[0].created_at,
        updatedAt: result[0].updated_at,
      };

      return { vehicle };
    }),

  delete: publicProcedure
    .input(z.object({ userId: z.string(), vehicleId: z.string() }))
    .mutation(async ({ input }) => {
      await ensureSql();

      const result = await sql`
        DELETE FROM user_vehicles
        WHERE id = ${input.vehicleId} AND user_id = ${input.userId}
        RETURNING *
      `;

      if (!result.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Vehicle not found",
        });
      }

      return { success: true };
    }),
});
