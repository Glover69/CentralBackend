import mongoose, { Document, Schema } from "mongoose";
import { getConnection } from "../../database";

interface User extends Document {
  id: string;
  email: string;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
  schedules: Schedule[]
}

export type Schedule = {
  semester: semester;
  classes: Class[];
  schedule_id: number;
  created_at: Date
  file_link?: string
}

export type Class = {
  course_name: string; // e.g., "Intro to AI"
  days: Days[]; // e.g., ["Monday", "Wednesday"]
  color: string;
  color_light: string; // e.g., "#B54708", "#FFFAEB"
}

export type semester = {
  semester_id: string; // Unique identifier for the semester, e.g., "fall-2025"
  schedule_name: string; // e.g., "Fall 2025"
  start_date: string; // e.g., "2025-08-05"
  end_date: string; // e.g., "2025-12-15"
  excluded_dates?: string[]; // e.g., ["2025-10-10", "2025-11-01"]
};

export type Days = {
  day: string; // e.g., "Monday"
  start_time: any
  end_time: any
  room: string
}

const schedulr = getConnection('schedulr')

const DaysSchema = new Schema<Days>({
    day: { type: String, required: true },
    start_time: { type: String, required: true },
    end_time: { type: String, required: true },
    room: { type: String, required: true}
})

const SemesterSchema = new Schema<semester>({
    semester_id: { type: String, required: true },
    schedule_name: { type: String, required: true },
    start_date: { type: String, required: true },
    end_date: { type: String, required: true },
    excluded_dates: { type: [String], required: false },
})

const ClassSchema = new Schema<Class>({
    course_name: { type: String, required: true },
    days: [DaysSchema],
    color: { type: String, required: true },
    color_light: { type: String, required: true },
})

const ScheduleSchema = new Schema<Schedule>({
  semester: SemesterSchema,
  classes: [ClassSchema],
  schedule_id: { type: Number, required: true },
  created_at: { type: Date, required: true },
  file_link: { type: String, required: false }
});


const UserSchema = new Schema<User>({
    id: {type: String, required: true },
    email: {type: String, required: true },
    name: {type: String, required: true },
    picture: {type: String, required: true },
    given_name: {type: String, required: true },
    family_name: {type: String, required: true },
    schedules: [ScheduleSchema]
}, { collection: "users" });

const SchedulrUserModel = schedulr.model<User>("users", UserSchema);

export { User, SchedulrUserModel };
