// ---- Auth Middleware ----
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";


export const authMiddleware = (req: any, res: any, next: any) => {
    let token = req.header("Authorization");
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    if (token.startsWith("Bearer ")) {
        token = token.slice(7).trim();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        req.user = decoded;
        next();
    } catch (error: any) {
        if (error.name === "TokenExpiredError") {
            // Send a specific error indicating token expiry so the frontend can act on it.
            return res.status(401).json({ message: "Token expired", expired: true });
        }
        res.status(400).json({ message: "Invalid Access Token" });
    }
};


// Conditional middleware to run authMiddleware only if ?type=admin is provided
export const conditionalAuth = (req: Request, res: Response, next: NextFunction): void => {
    if (req.query.type === "admin") {
      return authMiddleware(req, res, next);
    }
    next();
};