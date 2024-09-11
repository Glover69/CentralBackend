import mongoose, { Document, Schema } from 'mongoose';

interface Collection extends Document {
  collectionID: string;
  userID: string;
  files: string[];
}


const CollectionSchema = new Schema<Collection>({
  collectionID: {type: String, required: true},
  userID: { type: String, required: true },
  files: []
}, { collection: 'collections' });

const CollectionModel = mongoose.model<Collection>('collections', CollectionSchema);

export { Collection, CollectionModel };
