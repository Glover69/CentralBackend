"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchStatsModel = void 0;
const mongoose_1 = require("mongoose");
const auth_models_1 = require("./auth.models");
// --- Sub-schemas for better organization ---
const PlayerStatsSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    position: { type: String, required: true },
    rating: { type: Number, required: true },
    goals: { type: Number, required: true },
    assists: { type: Number, required: true },
    minutes: { type: Number, required: true },
    isStarter: { type: Boolean, required: true }
}, { _id: false });
const TeamStatsSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    players: [PlayerStatsSchema]
}, { _id: false });
const FullMatchStatsSchema = new mongoose_1.Schema({
    possession: {
        teamA: { type: Number, required: true },
        teamB: { type: Number, required: true }
    },
    shots: {
        teamA: { type: Number, required: true },
        teamB: { type: Number, required: true }
    },
    passes: {
        teamA: { type: Number, required: true },
        teamB: { type: Number, required: true }
    },
    tackles: {
        teamA: { type: Number, required: true },
        teamB: { type: Number, required: true }
    },
    corners: {
        teamA: { type: Number, required: true },
        teamB: { type: Number, required: true }
    },
    fouls: {
        teamA: { type: Number, required: true },
        teamB: { type: Number, required: true }
    },
    passAccuracy: {
        teamA: { type: Number, required: true },
        teamB: { type: Number, required: true }
    },
    shotsOnTarget: {
        teamA: { type: Number, required: true },
        teamB: { type: Number, required: true }
    },
    ballRecoveries: {
        teamA: { type: Number, required: true },
        teamB: { type: Number, required: true }
    },
    distances: {
        teamA: { type: Number, required: true },
        teamB: { type: Number, required: true }
    },
    sprints: {
        teamA: { type: Number, required: true },
        teamB: { type: Number, required: true }
    },
    heatmaps: {
        teamA: {
            attack: { type: Number, required: true },
            midfield: { type: Number, required: true },
            defense: { type: Number, required: true }
        },
        teamB: {
            attack: { type: Number, required: true },
            midfield: { type: Number, required: true },
            defense: { type: Number, required: true }
        }
    },
    insights: {
        dominantTeam: { type: String, required: true },
        keyMoments: [{
                time: { type: String, required: true },
                event: { type: String, required: true },
                team: { type: String, required: true }
            }],
        tacticalAnalysis: {
            formation: {
                teamA: { type: String, required: true },
                teamB: { type: String, required: true }
            },
            style: {
                teamA: { type: String, required: true },
                teamB: { type: String, required: true }
            },
            effectiveness: {
                teamA: { type: Number, required: true },
                teamB: { type: Number, required: true }
            }
        },
        playerPerformance: {
            mvp: {
                name: { type: String, required: true },
                team: { type: String, required: true },
                rating: { type: Number, required: true }
            },
            topScorer: {
                name: { type: String, required: true },
                team: { type: String, required: true },
                goals: { type: Number, required: true }
            },
            assists: {
                name: { type: String, required: true },
                team: { type: String, required: true },
                assists: { type: Number, required: true }
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
        id: { type: String, required: true, unique: true },
        title: { type: String, required: true },
        date: { type: String, required: true },
        duration: { type: String, required: false }, // Optional
        videoURL: { type: String, required: false }, // Optional
        description: { type: String, required: true },
        isProcessed: { type: Boolean, default: false }, // Defaults to false
        stats: { type: FullMatchStatsSchema, required: false } // The entire stats object is optional
    }
}, { collection: 'matchStats', timestamps: true }); // Added timestamps for createdAt/updatedAt
const MatchStatsModel = auth_models_1.AutoStatDbConnection.model('matchStats', MatchStatsSchema);
exports.MatchStatsModel = MatchStatsModel;
