import express from "express";
import { createSchedule, deleteSchedule, getUserSchedules } from "../controllers/user.controller";
const router = express.Router()


router.get("/get-data", getUserSchedules)
router.post("/save-schedule", createSchedule)
router.delete("/delete-one", deleteSchedule)


export default router