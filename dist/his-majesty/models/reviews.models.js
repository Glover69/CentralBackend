"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReviewsModel = void 0;
const mongoose_1 = require("mongoose");
const database_1 = require("../../database");
// const hisMajesty = getConnection('hisMajesty')
const reviewsSchema = new mongoose_1.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    initials: { type: String, required: false },
    email: { type: String, required: true },
    reviewTitle: { type: String, required: true },
    reviewMessage: { type: String, required: true },
    ratingValue: { type: Number, required: true },
    profileImage: { type: String, required: false },
    dateCreated: { type: Date, required: true, default: Date.now }, // Automatically sets the current date
    productId: { type: String, required: false }, // Optional field to link a review to a specific product
}, { collection: 'reviews' });
let reviewsModel = null;
const getReviewsModel = () => {
    if (!reviewsModel) {
        const hisMajesty = (0, database_1.getConnection)('hisMajesty');
        reviewsModel = hisMajesty.model('reviews', reviewsSchema);
    }
    return reviewsModel;
};
exports.getReviewsModel = getReviewsModel;
