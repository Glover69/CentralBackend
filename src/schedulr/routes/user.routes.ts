import express from "express";
import { createSchedule, deleteSchedule, getScheduleById, getUserSchedules, updateSchedule } from "../controllers/user.controller";
const router = express.Router()


router.get("/get-data", getUserSchedules)
router.get("/get-schedule", getScheduleById)
router.post("/save-schedule", createSchedule)
router.put("/update-schedule", updateSchedule)
router.delete("/delete-one", deleteSchedule)


export default router