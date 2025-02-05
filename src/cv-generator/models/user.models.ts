import mongoose, { Document, Schema } from 'mongoose';

interface User extends Document {
  customerID: string;
  emails: Email[];
  email: string;
  firstName: string;
  lastName: string;
  profilePhoto: string;
  verified: boolean;
  phoneNumber: string;
  files: Files[];
}

interface Email{
  email: string;
  verified: boolean;
}

interface Files{
  
}

const EmailSchema = new Schema<Email>({
  email: { type: String, required: true },
  verified: {type: Boolean, required: true },
});

const UserSchema = new Schema<User>({
  emails: [EmailSchema],
  email: {type: String, required: true},
  customerID: {type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  profilePhoto: { type: String, required: false },
  verified: { type: Boolean, required: true },
  phoneNumber: { type: String, required: true },

}, { collection: 'users' });

const UserModel = mongoose.model<User>('users', UserSchema);

export { User, UserModel };
