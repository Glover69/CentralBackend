"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSchedule = exports.createSchedule = exports.getUserSchedules = void 0;
const user_models_1 = require("../models/user.models");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const uuid_1 = require("uuid");
exports.getUserSchedules = [auth_middleware_1.requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c;
        const uid = (_a = req.user) === null || _a === void 0 ? void 0 : _a.uid; // set by requireAuth from the cookie session
        if (!uid) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        ;
        try {
            const userData = yield user_models_1.SchedulrUserModel.findOne({ id: uid }).lean();
            if (!userData) {
                res.status(400).send(`Failed to find any data for the user with id ${uid}.`);
                return;
            }
            res.status(200).send({ schedules: (_b = userData.schedules) !== null && _b !== void 0 ? _b : [] });
            console.log({ schedules: (_c = userData.schedules) !== null && _c !== void 0 ? _c : [] });
        }
        catch (error) {
            console.error("Get user data error:", error);
            res
                .status(500)
                .json({
                message: "Unable to process getting user data at this time",
                error: error,
            });
        }
    })];
exports.createSchedule = [auth_middleware_1.requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.query;
        const { semester, classes } = req.body;
        if (!semester || !classes) {
            res.status(400).send("Missing required fields from payload");
            return;
        }
        if (!id) {
            res.status(400).send("Missing required user id");
        }
        try {
            const user = yield user_models_1.SchedulrUserModel.findOne({ id: id });
            if (!user) {
                res.status(404).send(`Failed to find user with id: ${id}.`);
                return;
            }
            const schedule = {
                semester,
                classes,
                schedule_id: `sch-${(0, uuid_1.v4)()}`,
                created_at: new Date()
            };
            user.schedules.push(schedule);
            yield user.save();
            res.status(201).json({
                message: "Schedule created successfully",
                schedule: schedule
            });
        }
        catch (error) {
            console.error("Create schedule error:", error);
            res.status(500).json({
                message: "Unable to process creating schedule at this time",
                error: error,
            });
        }
    })];
exports.deleteSchedule = [auth_middleware_1.requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const uid = (_a = req.user) === null || _a === void 0 ? void 0 : _a.uid;
        const { scheduleId } = req.query;
        // Input validation
        if (!scheduleId || typeof scheduleId !== 'string') {
            res.status(400).json({ error: "Schedule ID is required" });
            return;
        }
        if (!scheduleId.startsWith('sch-')) {
            res.status(400).json({ error: "Invalid schedule ID format" });
            return;
        }
        try {
            // Find user and ensure they own the schedule
            const user = yield user_models_1.SchedulrUserModel.findOne({ id: uid });
            if (!user) {
                res.status(404).json({ error: "User not found" });
                return;
            }
            // Check if schedule exists and belongs to the user
            const scheduleIndex = user.schedules.findIndex(schedule => schedule.schedule_id === scheduleId);
            if (scheduleIndex === -1) {
                res.status(404).json({
                    error: "Schedule not found or you don't have permission to delete it"
                });
                return;
            }
            // Store schedule info for response (before deletion)
            const deletedSchedule = user.schedules[scheduleIndex];
            // Remove the schedule
            user.schedules.splice(scheduleIndex, 1);
            yield user.save();
            // Log for audit trail
            console.log(`🗑️ User ${uid} deleted schedule: ${scheduleId} (${deletedSchedule.semester.schedule_name})`);
            res.status(200).json({
                message: "Schedule deleted successfully",
                deletedSchedule: {
                    schedule_id: deletedSchedule.schedule_id,
                    schedule_name: deletedSchedule.semester.schedule_name,
                    created_at: deletedSchedule.created_at
                }
            });
        }
        catch (error) {
            console.error("Delete schedule error:", error);
            res.status(500).json({
                message: "Unable to delete schedule at this time",
                error: process.env.NODE_ENV === 'development' ? error : 'Internal server error'
            });
        }
    })];
