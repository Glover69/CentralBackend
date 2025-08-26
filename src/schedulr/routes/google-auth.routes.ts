import express from "express";
import { authCallback, getMe, logout } from "../controllers/google-auth.controller";
import { callbackCors } from "../../central";
const router = express.Router();


router.post("/auth-callback", callbackCors, authCallback)
router.get('/me', getMe);
router.post('/logout', logout);




export default router;