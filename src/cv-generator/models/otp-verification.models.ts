import mongoose, { Document, Schema } from 'mongoose';

interface OTPVerification extends Document {
  customerID: string;
  otp: string;
  createdAt: Date;
  expiresAt: Date;
}


const OTPVerificationSchema = new Schema<OTPVerification>({
  customerID: {type: String, required: true },
  otp: {type: String, required: true },
  createdAt: { type: Date, required: true },
  expiresAt: { type: Date, required: true },

}, { collection: 'otp' });

const OTPVerificationModel = mongoose.model<OTPVerification>('otp', OTPVerificationSchema);

export { OTPVerification, OTPVerificationModel };
