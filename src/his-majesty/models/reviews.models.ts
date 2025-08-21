import mongoose, { Connection, ConnectOptions, Document, Schema } from 'mongoose';
import { getConnection } from '../../database';
// dotenv.config(); // Load environment variables from .env file

// const dbUrlTwo = process.env.MONGODB_URI_TWO;

// if (!dbUrlTwo) {
//   console.error('MongoDB URIs are missing. Check your environment variables.');
//   process.exit(1);
// }

// const otherDbConnection = mongoose.createConnection(dbUrlTwo, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   } as ConnectOptions);

// // const connectDBTwo = async () => {
// //   try {
// //       await mongoose.connect(dbUrlTwo, {
// //         useNewUrlParser: true,
// //         useUnifiedTopology: true,
// //       } as ConnectOptions);
// //       console.log('Connected to MongoDB Database Two');
// //     } catch (error) {
// //       console.error('Error connecting to MongoDB Database Two:', error);
// //       process.exit(1);
// //     }
// // };

// // connectDBTwo();

interface reviews {
    ratingValue: number;
    reviewMessage : string;
    reviewTitle : string;
    firstName : string;
    lastName: string;
    initials?: string;
    email: string;
    dateCreated: Date;
    profileImage: string;
    productId?: string; // Optional field to store the product ID when reviewType is 'Products'
  _id: string | mongoose.Types.ObjectId;
}


// const hisMajesty = getConnection('hisMajesty')

const reviewsSchema = new Schema<reviews>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  initials: { type: String, required: false },
  email: { type: String, required: true },
  reviewTitle: { type: String, required: true },
  reviewMessage: { type: String, required: true },
  ratingValue: { type: Number, required: true },
  profileImage: { type: String, required: false },
  dateCreated: { type: Date, required: true, default: Date.now }, // Automatically sets the current date
  productId: { type: String, required: false }, // Optional field to link a review to a specific product
}, { collection: 'reviews' });


let reviewsModel: mongoose.Model<reviews> | null = null;

const getReviewsModel = () => {
  if (!reviewsModel) {
    const hisMajesty = getConnection('hisMajesty');
    reviewsModel = hisMajesty.model<reviews>('reviews', reviewsSchema);
  }
  return reviewsModel;
};

// const reviewsModel = hisMajesty.model<reviews>('reviews', reviewsSchema);

export { reviews, getReviewsModel };
