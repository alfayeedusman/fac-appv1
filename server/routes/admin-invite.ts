import { RequestHandler } from "express";
import { neonDbService } from "../services/neonDatabaseService";
import crypto from "crypto";

// POST /api/neon/admin/invite
// Protected by ADMIN_INVITE_SECRET header. Generates a user with a random password
// and returns the generated credentials in the response. Intended for secure
// administrative use only (do not expose this endpoint publicly).
export const createAdminInvite: RequestHandler = async (req, res) => {
  try {
    const secretHeader = (req.headers["x-admin-invite-secret"] || "") as string;
    const expectedSecret = process.env.ADMIN_INVITE_SECRET;

    if (!expectedSecret) {
      return res.status(500).json({
        success: false,
        error:
          "Admin invite secret not configured on server. Set ADMIN_INVITE_SECRET env var.",
      });
    }

    if (!secretHeader || secretHeader !== expectedSecret) {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }

    const { email, fullName, role, branchLocation } = req.body;

    if (!email || !fullName) {
      return res
        .status(400)
        .json({ success: false, error: "Missing email or fullName" });
    }

    // Restrict roles that can be assigned by this endpoint
    const allowedRoles = ["admin", "manager", "cashier"];
    let assignedRole = "admin";
    if (role && typeof role === "string") {
      if (role === "superadmin") {
        // Only allow superadmin creation if explicitly enabled via env var
        if (process.env.ALLOW_SUPERADMIN_INVITE !== "true") {
          return res.status(403).json({
            success: false,
            error: "Creating superadmin via invite is disabled",
          });
        }
        assignedRole = "superadmin";
      } else if (allowedRoles.includes(role)) {
        assignedRole = role as string;
      }
    }

    // Check if user already exists
    const existing = await neonDbService.getUserByEmail(email);
    if (existing) {
      return res
        .status(409)
        .json({ success: false, error: "User already exists" });
    }

    // Generate a strong random password and create user
    const rawPassword = crypto.randomBytes(8).toString("base64"); // 12+ chars

    const userData: any = {
      email,
      fullName,
      password: rawPassword,
      role: assignedRole,
      branchLocation: branchLocation || null,
      isActive: true,
      emailVerified: true,
    };

    const user = await neonDbService.createUser(userData);

    // Return the created user (without hashed password) and the raw password.
    const { password: _pw, ...userWithoutPassword } = user as any;

    return res.status(201).json({
      success: true,
      message: "Admin user created successfully",
      user: userWithoutPassword,
      rawPassword,
    });
  } catch (error: any) {
    console.error("admin-invite error:", error?.message || error);
    return res
      .status(500)
      .json({ success: false, error: error?.message || "Internal error" });
  }
};
