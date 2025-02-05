import { Request, Response } from 'express';
import { reviewsModel } from '../models/reviews.models';

// Get all reviews
export const getReviews = async(req: Request, res: Response) => {
    try {
        const reviewData = await reviewsModel.find();
        res.status(200).send(reviewData);
      } catch (error) {
        console.error(error);
        res.status(400).send(error);
      }
};

// Create a new review
export const createReview = async (req: Request, res: Response) => {
    try {
        const {
          ratingValue,
          reviewMessage,
          reviewTitle,
          reviewerName,
          email,
          profileImage,
          productId
        } = req.body;
    
    
        const reviewData = {
          ratingValue,
          reviewMessage,
          reviewTitle,
          reviewerName,
          email,
          profileImage,
          productId,
        };
    
        const savedReview = await reviewsModel.create(reviewData);
    
        if (savedReview) {
          res.status(201).json({
            message: "Added new review successfully",
            review: reviewData,
          });
        }
      } catch (error) {
        console.error(error);
        res.status(400).send(error);
      }
};

// Update a review
export const updateReview = (req: Request, res: Response) => {
    const { id } = req.params;
    // Logic to update a review by id
    res.send(`Update review with id ${id}`);
};

// Delete a review
export const deleteReview = (req: Request, res: Response) => {
    const { id } = req.params;
    // Logic to delete a review by id
    res.send(`Delete review with id ${id}`);
};