// ---- Auth Middleware ----
import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';



export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  picture?: string;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthUser;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.schedulr_session;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET_SCHEDULR!) as AuthUser & { exp: number; iat: number };
    req.user = { id: payload.id, email: payload.email, name: payload.name, picture: payload.picture };
    next();
  } catch {
    res.status(401).json({ error: 'Invalid session' });
  }
}





