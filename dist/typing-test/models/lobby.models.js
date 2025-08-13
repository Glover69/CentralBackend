"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.LobbyModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const PlayerSchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    progress: { type: Number, default: 0 },
    isReady: { type: Boolean, default: false, required: true }
});
const LobbySchema = new mongoose_1.Schema({
    code: { type: String, required: true, unique: true },
    timeLimit: { type: Number, required: true },
    wordCount: { type: Number, required: true },
    players: [PlayerSchema],
    words: [String],
    isActive: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now, expires: '1h' } // Auto-delete after 1hr
});
const LobbyModel = mongoose_1.default.model('Lobby', LobbySchema);
exports.LobbyModel = LobbyModel;
