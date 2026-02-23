import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { supabaseDbService } from "../services/supabaseDatabaseService";

export async function createContext({ req, res }: CreateExpressContextOptions) {
  const authHeader = req.headers.authorization;
  const sessionToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : undefined;

  let session: any = null;
  let user: any = null;

  if (sessionToken) {
    try {
      const storedSession = await supabaseDbService.getSessionByToken(
        sessionToken,
      );

      if (
        storedSession &&
        storedSession.isActive &&
        (!storedSession.expiresAt ||
          new Date(storedSession.expiresAt) > new Date())
      ) {
        session = storedSession;
        user = await supabaseDbService.getUserById(storedSession.userId);
      }
    } catch (error) {
      console.warn("tRPC context: unable to resolve session", error);
    }
  }

  return {
    req,
    res,
    session,
    user,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
