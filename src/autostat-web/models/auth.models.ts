import mongoose, { ConnectOptions, Document, Schema } from 'mongoose';
import * as dotenv from 'dotenv';
import { getConnection } from '../../database';
// dotenv.config(); // Load environment variables from .env file

// const dbUrlAutoStat = process.env.MONGODB_URI_AUTOSTAT;

// if (!dbUrlAutoStat) {
//   console.error('MongoDB URIs are missing. Check your environment variables.');
//   process.exit(1);
// }

// export const AutoStatDbConnection = mongoose.createConnection(dbUrlAutoStat, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   } as ConnectOptions);

interface User extends Document {
  email: string;
  firstName: string;
  lastName: string
  profile: string;
  userID: string;
  password: string;
  organization: string;
}


const UserSchema = new Schema<User>({
  email: {type: String, required: true},
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  profile: { type: String, required: false },
  userID: { type: String },
  password: { type: String, required: true },
  organization: { type: String, required: true },
}, { collection: 'users' });

let UserModel: mongoose.Model<User> | null = null;

const getUserModel = () => {
  if (!UserModel) {
    const hisMajesty = getConnection('hisMajesty');
    UserModel = hisMajesty.model<User>('reviews', UserSchema);
  }
  return UserModel;
};

// const UserModel = AutoStatDbConnection.model<User>('users', UserSchema);

export { User, getUserModel };
