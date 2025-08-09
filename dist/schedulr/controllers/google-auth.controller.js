"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.authCallback = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_models_1 = require("../models/user.models");
const google_auth_library_1 = require("google-auth-library");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const googleClient = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const authCallback = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log("Callback Origin:", req.headers.origin);
    console.log("Callback Referer:", req.headers.referer);
    console.log("🔥 Auth callback route HIT!");
    console.log("📝 Request method:", req.method);
    console.log("📝 Request body:", req.body);
    console.log("📝 Request query:", req.query);
    console.log("📝 Request headers:", req.headers);
    try {
        const { credential, g_csrf_token } = req.body || {};
        const csrfCookie = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.g_csrf_token;
        console.log("🎫 Credential received:", !!credential);
        if (!credential) {
            res.redirect(`${process.env.FRONTEND_URL || "http://localhost:4200"}/auth-callback?error=missing_credential`);
            return;
        }
        // CSRF check
        if (!g_csrf_token || !csrfCookie || g_csrf_token !== csrfCookie) {
            res.redirect(`${process.env.FRONTEND_URL || "http://localhost:4200"}/auth-callback?error=csrf`);
            return;
        }
        // Verify ID token with Google
        const ticket = yield googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.sub || !payload.email) {
            res.redirect(`${process.env.FRONTEND_URL || "http://localhost:4200"}/auth-callback?error=invalid_token`);
            return;
        }
        // Upsert user (if user doesn't exist in db, add. Or else, just update)
        const userDoc = yield user_models_1.SchedulrUserModel.findOneAndUpdate({ id: payload.sub }, {
            id: payload.sub,
            email: payload.email,
            name: payload.name,
            picture: payload.picture,
            given_name: payload.given_name,
            family_name: payload.family_name,
        }, { upsert: true, new: true, setDefaultsOnInsert: true });
        // Issue your app session JWT (cookie)
        const appJwt = jsonwebtoken_1.default.sign({
            uid: userDoc.id,
            email: userDoc.email,
            name: userDoc.name,
            picture: userDoc.picture,
        }, process.env.JWT_SECRET_SCHEDULR, { expiresIn: "7d" });
        res.cookie("schedulr_session", appJwt, {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: "/",
        });
        // Redirect back to SPA (no PII in URL)
        res.redirect(`${process.env.FRONTEND_URL || "http://localhost:4200"}/home`);
    }
    catch (err) {
        console.error("Auth callback error:", err);
        res.redirect(`${process.env.FRONTEND_URL || "http://localhost:4200"}/auth-callback?error=auth_failed`);
    }
});
exports.authCallback = authCallback;
exports.getMe = [
    auth_middleware_1.requireAuth,
    (req, res) => {
        if (!req.user)
            return res.status(401).json({ error: "Unauthorized" });
        res.json({ user: req.user });
    },
];
