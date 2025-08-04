import mongoose, { Schema, Document } from 'mongoose';

export type Player = {
  id: string;
  name: string;
//   progress: number;
  isReady: boolean;
  cursorIndex: number; // Added cursorIndex to track the player's cursor position
  accuracy: number,
  wpm: number,
  correctCharacters: number; // Added correctCharacters to track the number of correctly typed characters
  totalTypedCharacters: number; // Added totalTypedCharacters to track the total number of characters typed
  lastUpdate: number; // Added lastUpdate to track the last time the player updated their progress
}

interface Lobby extends Document {
  code: string;
  timeLimit: number;
  wordCount: number;
  players: Player[];
  words: string[];
  isActive: boolean;
  createdAt: Date;
}

const PlayerSchema: Schema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  progress: { type: Number, default: 0 },
  isReady: { type: Boolean, default: false, required: true }
});

const LobbySchema: Schema = new Schema({
  code: { type: String, required: true, unique: true },
  timeLimit: { type: Number, required: true },
  wordCount: { type: Number, required: true },
  players: [PlayerSchema],
  words: [String],
  isActive: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, expires: '1h' } // Auto-delete after 1hr
});


const LobbyModel = mongoose.model<Lobby>('Lobby', LobbySchema);
export { Lobby, LobbyModel };