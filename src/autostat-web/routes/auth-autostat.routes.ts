import express from "express";
import { loginAdmin, signupAdmin } from "../controllers/auth.controller";
const router = express.Router();


// Admin API's
router.post("/login", loginAdmin)
router.post("/register", signupAdmin)



export default router;