"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedbackModel = void 0;
const mongoose_1 = require("mongoose");
const database_1 = require("../../database");
const feedbackSchema = new mongoose_1.Schema({
    user_id: {
        type: String,
        required: true,
        index: true
    },
    rating: {
        type: String,
        enum: ['Poor', 'Fair', 'Good', 'Great', 'Excellent'],
        required: true
    },
    message: {
        type: String,
        required: true,
        maxlength: 1000
    },
    feedback_id: {
        type: String,
        required: true,
        unique: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});
// Index for efficient querying
feedbackSchema.index({ user_id: 1, created_at: -1 });
const schedulr = (0, database_1.getConnection)('schedulr');
exports.FeedbackModel = schedulr.model('feedback', feedbackSchema);
