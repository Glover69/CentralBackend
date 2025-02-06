"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const review_controller_1 = require("../controllers/review.controller");
const router = (0, express_1.Router)();
// Get all reviews
router.get('/', review_controller_1.getReviews);
// Get reviews by product ID
router.get('/:productId', review_controller_1.getReviewsByProductId);
// Create a new review
router.post('/', review_controller_1.createReview);
// Update a review
router.put('/:id', review_controller_1.updateReview);
// Delete a review
router.delete('/:id', review_controller_1.deleteReview);
exports.default = router;
