"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const google_auth_controller_1 = require("../controllers/google-auth.controller");
const router = express_1.default.Router();
router.post("/auth-callback", google_auth_controller_1.authCallback);
router.post("/mobile", google_auth_controller_1.mobileAuth);
router.get('/me', google_auth_controller_1.getMe);
router.post('/logout', google_auth_controller_1.logout);
exports.default = router;
