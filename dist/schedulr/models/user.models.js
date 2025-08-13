"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulrUserModel = void 0;
const mongoose_1 = require("mongoose");
const database_1 = require("../../database");
const schedulr = (0, database_1.getConnection)('schedulr');
const DaysSchema = new mongoose_1.Schema({
    day: { type: String, required: true },
    start_time: { type: String, required: true },
    end_time: { type: String, required: true },
    room: { type: String, required: true }
});
const SemesterSchema = new mongoose_1.Schema({
    semester_id: { type: String, required: true },
    schedule_name: { type: String, required: true },
    start_date: { type: String, required: true },
    end_date: { type: String, required: true },
    excluded_dates: { type: [String], required: false },
});
const ClassSchema = new mongoose_1.Schema({
    course_name: { type: String, required: true },
    days: [DaysSchema],
    color: { type: String, required: true },
    color_light: { type: String, required: true },
});
const ScheduleSchema = new mongoose_1.Schema({
    semester: SemesterSchema,
    classes: [ClassSchema],
    schedule_id: { type: Number, required: true },
    created_at: { type: Date, required: true },
    file_link: { type: String, required: false }
});
const UserSchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    email: { type: String, required: true },
    name: { type: String, required: true },
    picture: { type: String, required: true },
    given_name: { type: String, required: true },
    family_name: { type: String, required: true },
    schedules: [ScheduleSchema]
}, { collection: "users" });
const SchedulrUserModel = schedulr.model("users", UserSchema);
exports.SchedulrUserModel = SchedulrUserModel;
