import express from "express";
import { loginAdmin, signupAdmin } from "../controllers/auth.controller";
import { addMatchProcess, getAllMatchProcesses, getSpecificMatchProcess } from "../controllers/match-process.controller";
const router = express.Router();


// Admin API's
router.get("/all", getAllMatchProcesses)
router.get("/one", getSpecificMatchProcess)
router.post("/add", addMatchProcess)




export default router;