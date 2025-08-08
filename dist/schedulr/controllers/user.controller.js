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
exports.createSchedule = exports.getUserSchedules = void 0;
const user_models_1 = require("../models/user.models");
const auth_middleware_1 = require("../middlewares/auth.middleware");
exports.getUserSchedules = [auth_middleware_1.requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.query;
        if (!id) {
            res.status(404).send(`Failed to find user with id ${id}`);
            return;
        }
        try {
            const userData = yield user_models_1.SchedulrUserModel.findOne({ id: id });
            if (!userData) {
                res.status(404).send(`Failed to find any data for the user with id ${id}.`);
                return;
            }
            else {
                res.status(200).send(userData);
            }
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
        const { semester, classes, schedule_id, created_at } = req.body;
        if (!semester || !classes || !schedule_id || !created_at) {
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
                semester: semester,
                classes: classes,
                schedule_id: schedule_id,
                created_at: created_at
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
