import express from "express";
import { authCallback, getMe, logout } from "../controllers/google-auth.controller";
const router = express.Router();


router.post("/auth-callback", authCallback)
router.get('/me', getMe);
router.post('/logout', logout);




export default router;