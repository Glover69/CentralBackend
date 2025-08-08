"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const google_auth_controller_1 = require("../controllers/google-auth.controller");
const central_1 = require("../../central");
const router = express_1.default.Router();
router.post("/auth-callback", central_1.callbackCors, google_auth_controller_1.authCallback);
router.get('/me', google_auth_controller_1.getMe);
exports.default = router;
