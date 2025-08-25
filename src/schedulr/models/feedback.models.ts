import mongoose, { Document, Schema } from 'mongoose';
import { getConnection } from "../../database";

export interface Feedback extends Document {
  user_id: string;
  rating: 'Poor' | 'Fair' | 'Good' | 'Great' | 'Excellent';
  message: string;
  feedback_id: string;
  created_at: Date;
}

const feedbackSchema = new Schema<Feedback>({
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

const schedulr = getConnection('schedulr');
export const FeedbackModel = schedulr.model<Feedback>('feedback', feedbackSchema);
