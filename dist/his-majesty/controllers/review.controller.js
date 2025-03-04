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
exports.deleteReview = exports.updateReview = exports.createReview = exports.getReviewsByProductId = exports.getReviews = void 0;
const reviews_models_1 = require("../models/reviews.models");
// Get all reviews
const getReviews = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const reviewData = yield reviews_models_1.reviewsModel.find();
        res.status(200).send(reviewData);
    }
    catch (error) {
        console.error(error);
        res.status(400).send(error);
    }
});
exports.getReviews = getReviews;
const getReviewsByProductId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { productId } = req.params;
        const reviewData = yield reviews_models_1.reviewsModel.find({ productId });
        res.status(200).send(reviewData);
    }
    catch (error) {
        console.error(error);
        res.status(400).send(error);
    }
});
exports.getReviewsByProductId = getReviewsByProductId;
// Create a new review
const createReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { ratingValue, reviewMessage, reviewTitle, firstName, lastName, initials, email, profileImage, productId, } = req.body;
        // Validate firstName and lastName before using them
        if (typeof firstName !== "string" || typeof lastName !== "string") {
            return res
                .status(400)
                .json({
                message: "First name and last name are required and must be strings.",
            });
        }
        const reviewData = {
            ratingValue,
            reviewMessage,
            reviewTitle,
            firstName,
            lastName,
            initials,
            email,
            profileImage,
            productId,
        };
        reviewData.initials = `${firstName.charAt(0) || ''}${lastName.charAt(0) || ''}`;
        const savedReview = yield reviews_models_1.reviewsModel.create(reviewData);
        if (savedReview) {
            res.status(201).json({
                message: "Added new review successfully",
                review: reviewData,
            });
        }
    }
    catch (error) {
        console.error(error);
        res.status(400).send(error);
    }
});
exports.createReview = createReview;
// Update a review
const updateReview = (req, res) => {
    const { id } = req.params;
    // Logic to update a review by id
    res.send(`Update review with id ${id}`);
};
exports.updateReview = updateReview;
// Delete a review
const deleteReview = (req, res) => {
    const { id } = req.params;
    // Logic to delete a review by id
    res.send(`Delete review with id ${id}`);
};
exports.deleteReview = deleteReview;
