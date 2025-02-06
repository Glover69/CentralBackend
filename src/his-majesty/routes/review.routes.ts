import { Router } from 'express';
import { getReviews, createReview, updateReview, deleteReview, getReviewsByProductId } from '../controllers/review.controller';

const router = Router();

// Get all reviews
router.get('/', getReviews);

// Get reviews by product ID
router.get('/:productId', getReviewsByProductId);

// Create a new review
router.post('/', createReview);

// Update a review
router.put('/:id', updateReview);

// Delete a review
router.delete('/:id', deleteReview);


export default router;