import mongoose, { Document, Schema } from 'mongoose';

interface Secret extends Document {
  customerID: string;
  password: string;
}


const SecretSchema = new Schema<Secret>({
  password: { type: String, required: true },
  customerID: {type: String, required: true },
}, { collection: 'vault' });

const SecretModel = mongoose.model<Secret>('vault', SecretSchema);

export { Secret, SecretModel };
