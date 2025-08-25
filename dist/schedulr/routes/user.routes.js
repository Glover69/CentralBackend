"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const router = express_1.default.Router();
router.get("/get-data", user_controller_1.getUserSchedules);
router.get("/get-schedule", user_controller_1.getScheduleById);
router.post("/save-schedule", user_controller_1.createSchedule);
router.put("/update-schedule", user_controller_1.updateSchedule);
router.delete("/delete-one", user_controller_1.deleteSchedule);
exports.default = router;
