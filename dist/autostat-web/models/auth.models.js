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
exports.UserModel = exports.AutoStatDbConnection = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const dotenv = __importStar(require("dotenv"));
dotenv.config(); // Load environment variables from .env file
const dbUrlAutoStat = process.env.MONGODB_URI_AUTOSTAT;
if (!dbUrlAutoStat) {
    console.error('MongoDB URIs are missing. Check your environment variables.');
    process.exit(1);
}
exports.AutoStatDbConnection = mongoose_1.default.createConnection(dbUrlAutoStat, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const UserSchema = new mongoose_1.Schema({
    email: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    profile: { type: String, required: false },
    userID: { type: String },
    password: { type: String, required: true },
    organization: { type: String, required: true },
}, { collection: 'users' });
const UserModel = exports.AutoStatDbConnection.model('users', UserSchema);
exports.UserModel = UserModel;
