import { router } from "./trpc";
import { authRouter } from "../trpc-routers/auth";
import { bookingsRouter } from "../trpc-routers/bookings";
import { subscriptionsRouter } from "../trpc-routers/subscriptions";
import { vehiclesRouter } from "../trpc-routers/vehicles";
import { notificationsRouter } from "../trpc-routers/notifications";
import { loyaltyRouter } from "../trpc-routers/loyalty";

export const appRouter = router({
  auth: authRouter,
  bookings: bookingsRouter,
  subscriptions: subscriptionsRouter,
  vehiclesV2: vehiclesRouter,
  notificationsV2: notificationsRouter,
  loyaltyV2: loyaltyRouter,
});

export type AppRouter = typeof appRouter;
