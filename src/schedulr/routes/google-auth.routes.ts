import express from "express";
import { authCallback, getMe, logout, mobileAuth } from "../controllers/google-auth.controller";
const router = express.Router();


router.post("/auth-callback", authCallback);
router.post("/mobile", mobileAuth);
router.get('/me', getMe);
router.post('/logout', logout);




export default router;