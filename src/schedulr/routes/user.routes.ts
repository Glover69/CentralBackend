import express from "express";
import { createSchedule, getUserSchedules } from "../controllers/user.controller";
const router = express.Router()


router.get("/get-data", getUserSchedules)
router.post("/create", createSchedule)


export default router