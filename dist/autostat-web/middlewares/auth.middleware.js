"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.conditionalAuth = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware = (req, res, next) => {
    let token = req.header("Authorization");
    if (!token)
        return res.status(401).json({ message: "Unauthorized" });
    if (token.startsWith("Bearer ")) {
        token = token.slice(7).trim();
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        if (error.name === "TokenExpiredError") {
            // Send a specific error indicating token expiry so the frontend can act on it.
            return res.status(401).json({ message: "Token expired", expired: true });
        }
        res.status(400).json({ message: "Invalid Access Token" });
    }
};
exports.authMiddleware = authMiddleware;
// Conditional middleware to run authMiddleware only if ?type=admin is provided
const conditionalAuth = (req, res, next) => {
    if (req.query.type === "admin") {
        return (0, exports.authMiddleware)(req, res, next);
    }
    next();
};
exports.conditionalAuth = conditionalAuth;
