"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchStatsModel = void 0;
const mongoose_1 = require("mongoose");
const auth_models_1 = require("./auth.models");
// --- Sub-schemas for better organization ---
const PlayerStatsSchema = new mongoose_1.Schema({
    name: { type: String, required: false },
    position: { type: String, required: false },
    rating: { type: Number, required: false },
    goals: { type: Number, required: false },
    assists: { type: Number, required: false },
    minutes: { type: Number, required: false },
    isStarter: { type: Boolean, required: false }
}, { _id: false });
const TeamStatsSchema = new mongoose_1.Schema({
    name: { type: String, required: false },
    rating: { type: Number, required: false },
    players: [PlayerStatsSchema]
}, { _id: false });
const FullMatchStatsSchema = new mongoose_1.Schema({
    possession: {
        teamA: { type: Number, required: false },
        teamB: { type: Number, required: false }
    },
    goals: {
        teamA: { type: Number, required: false },
        teamB: { type: Number, required: false }
    },
    shots: {
        teamA: { type: Number, required: false },
        teamB: { type: Number, required: false }
    },
    passes: {
        teamA: { type: Number, required: false },
        teamB: { type: Number, required: false }
    },
    tackles: {
        teamA: { type: Number, required: false },
        teamB: { type: Number, required: false }
    },
    corners: {
        teamA: { type: Number, required: false },
        teamB: { type: Number, required: false }
    },
    fouls: {
        teamA: { type: Number, required: false },
        teamB: { type: Number, required: false }
    },
    passAccuracy: {
        teamA: { type: Number, required: false },
        teamB: { type: Number, required: false }
    },
    shotsOnTarget: {
        teamA: { type: Number, required: false },
        teamB: { type: Number, required: false }
    },
    ballRecoveries: {
        teamA: { type: Number, required: false },
        teamB: { type: Number, required: false }
    },
    distances: {
        teamA: { type: Number, required: false },
        teamB: { type: Number, required: false }
    },
    sprints: {
        teamA: { type: Number, required: false },
        teamB: { type: Number, required: false }
    },
    heatmaps: {
        teamA: {
            attack: { type: Number, required: false },
            midfield: { type: Number, required: false },
            defense: { type: Number, required: false }
        },
        teamB: {
            attack: { type: Number, required: false },
            midfield: { type: Number, required: false },
            defense: { type: Number, required: false }
        }
    },
    insights: {
        dominantTeam: { type: String, required: false },
        keyMoments: [{
                time: { type: String, required: false },
                event: { type: String, required: false },
                team: { type: String, required: false }
            }],
        tacticalAnalysis: {
            formation: {
                teamA: { type: String, required: false },
                teamB: { type: String, required: false }
            },
            style: {
                teamA: { type: String, required: false },
                teamB: { type: String, required: false }
            },
            effectiveness: {
                teamA: { type: Number, required: false },
                teamB: { type: Number, required: false }
            }
        },
        playerPerformance: {
            mvp: {
                name: { type: String, required: false },
                team: { type: String, required: false },
                rating: { type: Number, required: false }
            },
            topScorer: {
                name: { type: String, required: false },
                team: { type: String, required: false },
                goals: { type: Number, required: false }
            },
            assists: {
                name: { type: String, required: false },
                team: { type: String, required: false },
                assists: { type: Number, required: false }
            }
        }
    },
    teams: {
        teamA: TeamStatsSchema,
        teamB: TeamStatsSchema
    },
    improvementInsights: {
        teamA: [{
                category: { type: String, required: false },
                issue: { type: String, required: false },
                suggestion: { type: String, required: false },
                priority: { type: String, enum: ['high', 'medium', 'low'], required: false }
            }],
        teamB: [{
                category: { type: String, required: false },
                issue: { type: String, required: false },
                suggestion: { type: String, required: false },
                priority: { type: String, enum: ['high', 'medium', 'low'], required: false }
            }],
        players: [{
                name: { type: String, required: false },
                team: { type: String, required: false },
                weaknesses: [{
                        area: { type: String, required: false },
                        description: { type: String, required: false },
                        suggestion: { type: String, required: false }
                    }],
                strengths: [{ type: String, required: false }]
            }]
    }
}, { _id: false });
// --- Main Schema ---
const MatchStatsSchema = new mongoose_1.Schema({
    match: {
        id: { type: String, required: true, unique: false },
        userID: { type: String, required: true }, // Assuming userID is required
        title: { type: String, required: true },
        date: { type: String, required: true },
        duration: { type: String, required: false }, // Optional
        videoURL: { type: String, required: true }, // Optional
        description: { type: String, required: true },
        isProcessed: { type: Boolean, default: false }, // Defaults to false
        focusOnMyTeam: { type: Boolean, default: false }, // Defaults to false
        stats: { type: FullMatchStatsSchema, required: false } // The entire stats object is optional
    }
}, { collection: 'matchStats', timestamps: true }); // Added timestamps for createdAt/updatedAt
const MatchStatsModel = auth_models_1.AutoStatDbConnection.model('matchStats', MatchStatsSchema);
exports.MatchStatsModel = MatchStatsModel;
