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
exports.reviewsModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const dotenv = __importStar(require("dotenv"));
dotenv.config(); // Load environment variables from .env file
const dbUrlTwo = process.env.MONGODB_URI_TWO;
if (!dbUrlTwo) {
    console.error('MongoDB URIs are missing. Check your environment variables.');
    process.exit(1);
}
const otherDbConnection = mongoose_1.default.createConnection(dbUrlTwo, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const reviewsSchema = new mongoose_1.Schema({
    reviewerName: { type: String, required: true },
    reviewTitle: { type: String, required: true },
    reviewMessage: { type: String, required: true },
    ratingValue: { type: Number, required: true },
    profileImage: { type: String, required: false },
    dateCreated: { type: Date, required: true, default: Date.now() }, // Automatically sets the current date
    productId: { type: String, required: false }, // Optional field to link a review to a specific product
}, { collection: 'reviews' });
const reviewsModel = otherDbConnection.model('reviews', reviewsSchema);
exports.reviewsModel = reviewsModel;
