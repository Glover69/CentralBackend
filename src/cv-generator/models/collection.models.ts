import mongoose, { Document, Schema } from "mongoose";

interface Collection extends Document {
  collectionID: string;
  customerID: string;
  files: Data[];
}

interface Data {
  firstname?: string;
  lastname?: string;
  jobTitle?: string;
  profileImage?: string;
  website?: string;
  linkedIn?: string;
  github?: string;
  email?: string;
  phone?: string;
  profile: string;
  skills?: Skills[];
  experiences?: Experience[];
  education?: Education[];
  templateInfo?: TemplateInfo[];
}

export interface Skills {
  name: string;
  color: string;
  backgroundColor: string;
  filter: string;
}

export interface Experience {
  jobTitle: string;
  company: string;
  location: string;
  type: string;
  startDate: string;
  endDate: string;
  points: string[];
}

export interface Education {
  institution: string;
  certification: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
}

export interface TemplateInfo {
  templateID: string;
}

const SkillsSchema = new Schema<Skills>({
  name: { type: String, required: true },
  color: { type: String, required: true },
  backgroundColor: { type: String, required: true },
  filter: { type: String, required: true },
});

const ExperiencesSchema = new Schema<Experience>({
  jobTitle: { type: String, required: true, trim: true },
  company: { type: String, required: true, trim: true},
  location: { type: String,  required: true,  trim: true},
  type: { type: String, required: true, trim: true},
  startDate: {type: String, required: true},
  endDate: { type: String, required: false},
  points: { type: [String], required: false},
});

const EducationSchema = new Schema<Education>({
  institution: {type: String, required: true},
  certification: {type: String, required: true},
  fieldOfStudy: {type: String, required: true},
  startDate: {type: String, required: true},
  endDate: {type: String, required: false},
});

const TemplateInfoSchema = new Schema<TemplateInfo>({
  templateID: {type: String, required: false},
});

const DataSchema = new Schema<Data>({
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

const CollectionSchema = new Schema<Collection>(
  {
    collectionID: { type: String, required: true },
    customerID: { type: String, required: true },
    files: [DataSchema],
  },
  { collection: "collections" }
);

const CollectionModel = mongoose.model<Collection>(
  "collections",
  CollectionSchema
);

export { Collection, CollectionModel };
