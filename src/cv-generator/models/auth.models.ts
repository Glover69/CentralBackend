import mongoose, { Document, Schema } from 'mongoose';

interface User extends Document {
  email: string;
  isEmailVerified: boolean;
  fullname: string;
  profile: string;
  authID: string;
  customerID: string;
  collectionID: string;
}


const UserSchema = new Schema<User>({
  email: {type: String, required: true},
  fullname: { type: String, required: true },
  profile: { type: String, required: false },
  isEmailVerified: { type: Boolean, required: true },
  authID: { type: String, required: true },
  customerID: { type: String },
  collectionID: { type: String }
}, { collection: 'users' });

const UserModel = mongoose.model<User>('users', UserSchema);

export { User, UserModel };
