"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectionModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const SkillsSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    color: { type: String, required: true },
    backgroundColor: { type: String, required: true },
    filter: { type: String, required: true },
});
const ExperiencesSchema = new mongoose_1.Schema({
    jobTitle: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: false },
    points: { type: [String], required: false },
});
const EducationSchema = new mongoose_1.Schema({
    institution: { type: String, required: true },
    certification: { type: String, required: true },
    fieldOfStudy: { type: String, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: false },
});
const TemplateInfoSchema = new mongoose_1.Schema({
    templateID: { type: String, required: false },
});
const DataSchema = new mongoose_1.Schema({
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    jobTitle: { type: String, required: true },
    profileImage: { type: String, required: true },
    website: { type: String, required: false },
    linkedIn: { type: String, required: false },
    github: { type: String, required: false },
    email: { type: String, required: false },
    phone: { type: String, required: false },
    profile: { type: String, required: true },
    skills: [SkillsSchema],
    experiences: [ExperiencesSchema],
    education: [EducationSchema],
    templateInfo: [TemplateInfoSchema],
});
const CollectionSchema = new mongoose_1.Schema({
    collectionID: { type: String, required: true },
    customerID: { type: String, required: true },
    files: [DataSchema],
}, { collection: "collections" });
const CollectionModel = mongoose_1.default.model("collections", CollectionSchema);
exports.CollectionModel = CollectionModel;
