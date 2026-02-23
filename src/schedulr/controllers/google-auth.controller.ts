import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { SchedulrUserModel } from "../models/user.models";
import { OAuth2Client } from "google-auth-library";
import { requireAuth } from "../middlewares/auth.middleware";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID!);

export const authCallback = async (
  req: Request,
  res: Response
): Promise<void> => {
  console.log("Callback Origin:", req.headers.origin);
  console.log("Callback Referer:", req.headers.referer);

  console.log("🔥 Auth callback route HIT!");
  console.log("📝 Request method:", req.method);
  console.log("📝 Request body:", req.body);
  console.log("📝 Request query:", req.query);
  console.log("📝 Request headers:", req.headers);
  console.log("📝 Request cookies:", req.cookies)

  try {
    const { credential, g_csrf_token } = req.body || {};
    const csrfCookie = req.cookies?.g_csrf_token;
    console.log("🎫 Credential received:", !!credential);

    if (!credential) {
      res.redirect(
        `${
          process.env.SCHEDULR_PROD_URL || "http://localhost:4200"
        }/auth-callback?error=missing_credential`
      );
      return;
    }

    // CSRF check
    if (!g_csrf_token || !csrfCookie || g_csrf_token !== csrfCookie) {
      res.redirect(
        `${
          process.env.SCHEDULR_PROD_URL || "http://localhost:4200"
        }/auth-callback?error=csrf`
      );
      return;
    }

    // Verify ID token with Google
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.sub || !payload.email) {
      res.redirect(
        `${
          process.env.SCHEDULR_PROD_URL || "http://localhost:4200"
        }/auth-callback?error=invalid_token`
      );
      return;
    }

    // Upsert user (if user doesn't exist in db, add. Or else, just update)
    const userDoc = await SchedulrUserModel.findOneAndUpdate(
      { id: payload.sub },
      {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        given_name: payload.given_name,
        family_name: payload.family_name,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Issue your app session JWT (cookie)
    const appJwt = jwt.sign(
      {
        uid: userDoc.id,
        email: userDoc.email,
        name: userDoc.name,
        picture: userDoc.picture,
      },
      process.env.JWT_SECRET_SCHEDULR!,
      { expiresIn: "7d" }
    );

    res.cookie("schedulr_session", appJwt, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    // Redirect back to SPA (no PII in URL)
    res.redirect(`${process.env.SCHEDULR_PROD_URL || "http://localhost:4200"}/home`);
  } catch (err: any) {
    console.error("Auth callback error:", err);
    res.redirect(
      `${
        process.env.SCHEDULR_PROD_URL || "http://localhost:4200"
      }/auth-callback?error=auth_failed`
    );
  }
};

export const getMe = [
  requireAuth,
  (req: Request, res: Response) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    res.json({ user: req.user });
  },
];

export const logout = (req: Request, res: Response) => {
  try {
    // Clear the JWT cookie by setting it to expire immediately
    res.clearCookie('schedulr_session', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });

    // Log for audit trail
    console.log(`🚪 User logged out successfully`);

    // Return success response
    res.status(200).json({
      message: "Logged out successfully",
      success: true
    });

  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      message: "Unable to logout at this time",
      error: process.env.NODE_ENV === 'development' ? error : 'Internal server error'
    });
  }
};

/**
 * Mobile auth endpoint.
 * Receives a Google ID token from the mobile app, verifies it server-side,
 * upserts the user in the database, and returns a JWT + user data as JSON.
 */
export const mobileAuth = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { idToken } = req.body || {};

    if (!idToken) {
      res.status(400).json({ error: "missing_id_token" });
      return;
    }

    // Verify ID token with Google
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_IOS_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.sub || !payload.email) {
      res.status(401).json({ error: "invalid_token" });
      return;
    }

    // Upsert user (create if doesn't exist, update if it does)
    const userDoc = await SchedulrUserModel.findOneAndUpdate(
      { id: payload.sub },
      {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        given_name: payload.given_name,
        family_name: payload.family_name,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Issue app JWT
    const token = jwt.sign(
      {
        uid: userDoc.id,
        email: userDoc.email,
        name: userDoc.name,
        picture: userDoc.picture,
      },
      process.env.JWT_SECRET_SCHEDULR!,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      user: {
        uid: userDoc.id,
        email: userDoc.email,
        name: userDoc.name,
        picture: userDoc.picture,
        given_name: userDoc.given_name,
        family_name: userDoc.family_name,
      },
      token,
    });
  } catch (err: any) {
    console.error("Mobile auth error:", err);
    res.status(500).json({ error: "auth_failed" });
  }
};
