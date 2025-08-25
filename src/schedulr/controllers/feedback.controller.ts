import { Request, Response } from "express";
import { FeedbackModel } from "../models/feedback.models";
import { requireAuth } from "../middlewares/auth.middleware";
import { v4 as uuidv4 } from "uuid";

export const submitFeedback = [requireAuth, async (req: Request, res: Response): Promise<void> => {
  const uid = req.user?.uid;
  const { rating, message }: { rating: string, message: string } = req.body;

  // Input validation
  if (!rating || !message) {
    res.status(400).json({ error: "Rating and message are required" });
    return;
  }

  if (!['Poor', 'Fair', 'Good', 'Great', 'Excellent'].includes(rating)) {
    res.status(400).json({ error: "Invalid rating value" });
    return;
  }

  if (message.length > 1000) {
    res.status(400).json({ error: "Message must be 1000 characters or less" });
    return;
  }

  if (message.trim().length < 5) {
    res.status(400).json({ error: "Message must be at least 5 characters long" });
    return;
  }

  try {
    const feedback = new FeedbackModel({
      user_id: uid,
      rating: rating as 'Poor' | 'Fair' | 'Good' | 'Great' | 'Excellent',
      message: message.trim(),
      feedback_id: `fb-${uuidv4()}`,
      created_at: new Date()
    });

    await feedback.save();

    // Log for monitoring
    console.log(`📝 User ${uid} submitted feedback: ${rating} - "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`);

    res.status(201).json({
      message: "Feedback submitted successfully",
      feedback: {
        feedback_id: feedback.feedback_id,
        rating: feedback.rating,
        created_at: feedback.created_at
      }
    });

  } catch (error) {
    console.error("Submit feedback error:", error);
    res.status(500).json({
      message: "Unable to submit feedback at this time",
      error: process.env.NODE_ENV === 'development' ? error : 'Internal server error'
    });
  }
}];

export const getUserFeedback = [requireAuth, async (req: Request, res: Response): Promise<void> => {
  const uid = req.user?.uid;
  const { limit = 10, page = 1 } = req.query;

  try {
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string) || 10));
    const skip = (pageNum - 1) * limitNum;

    const feedbackList = await FeedbackModel
      .find({ user_id: uid })
      .sort({ created_at: -1 })
      .limit(limitNum)
      .skip(skip)
      .select('-__v')
      .lean();

    const total = await FeedbackModel.countDocuments({ user_id: uid });

    res.status(200).json({
      feedback: feedbackList,
      pagination: {
        current_page: pageNum,
        total_pages: Math.ceil(total / limitNum),
        total_count: total,
        has_next: pageNum * limitNum < total,
        has_prev: pageNum > 1
      }
    });

  } catch (error) {
    console.error("Get user feedback error:", error);
    res.status(500).json({
      message: "Unable to retrieve feedback at this time",
      error: process.env.NODE_ENV === 'development' ? error : 'Internal server error'
    });
  }
}];
