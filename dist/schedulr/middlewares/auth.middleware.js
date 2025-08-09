"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function requireAuth(req, res, next) {
    var _a;
    const token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.schedulr_session;
    if (!token)
        return res.status(401).json({ error: 'Unauthorized' });
    try {
        const payload = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET_SCHEDULR);
        req.user = { uid: payload.uid, email: payload.email, name: payload.name, picture: payload.picture };
        next();
    }
    catch (_b) {
        res.status(401).json({ error: 'Invalid session' });
    }
}
exports.requireAuth = requireAuth;
