import mongoose, { Document, Schema } from "mongoose";
import { AutoStatDbConnection } from "./auth.models";

// Interface for a single player's stats
interface PlayerStats {
    name: string;
    position: string;
    rating: number;
    goals: number;
    assists: number;
    minutes: number;
    isStarter: boolean;
}

// Interface for team-specific stats
interface TeamStats {
    name: string;
    rating: number;
    players: PlayerStats[];
}

// Interface for the full stats block
interface FullMatchStats {
    possession: { teamA: number; teamB: number };
    shots: { teamA: number; teamB: number };
    passes: { teamA: number; teamB: number };
    tackles: { teamA: number; teamB: number };
    corners: { teamA: number; teamB: number };
    fouls: { teamA: number; teamB: number };
    passAccuracy: { teamA: number; teamB: number };
    shotsOnTarget: { teamA: number; teamB: number };
    ballRecoveries: { teamA: number; teamB: number };
    distances: { teamA: number; teamB: number };
    sprints: { teamA: number; teamB: number };
    heatmaps: {
        teamA: { attack: number; midfield: number; defense: number };
        teamB: { attack: number; midfield: number; defense: number };
    };
    insights: {
        dominantTeam: string;
        keyMoments: Array<{ time: string; event: string; team: string }>;
        tacticalAnalysis: {
            formation: { teamA: string; teamB: string };
            style: { teamA: string; teamB: string };
            effectiveness: { teamA: number; teamB: number };
        };
        playerPerformance: {
            mvp: { name: string; team: string; rating: number };
            topScorer: { name: string; team: string; goals: number };
            assists: { name: string; team: string; assists: number };
        };
    };
    teams: {
        teamA: TeamStats;
        teamB: TeamStats;
    };
    improvementInsights: {
        teamA: Array<{
            category: string;
            issue: string;
            suggestion: string;
            priority: 'high' | 'medium' | 'low';
        }>;
        teamB: Array<{
            category: string;
            issue: string;
            suggestion: string;
            priority: 'high' | 'medium' | 'low';
        }>;
        players: Array<{
            name: string;
            team: string;
            weaknesses: Array<{
                area: string;
                description: string;
                suggestion: string;
            }>;
            strengths: Array<string>;
        }>;
    };
}

// Main interface for the document
interface MatchStatsProps extends Document {
    match: {
        id: string;
        title: string;
        date: string;
        duration?: string; // Optional
        videoURL?: string; // Optional
        description: string;
        isProcessed: boolean; // Will default to false
        stats?: FullMatchStats | null; // The entire stats block is optional
    };
}

// --- Sub-schemas for better organization ---

const PlayerStatsSchema = new Schema({
    name: { type: String, required: true },
    position: { type: String, required: true },
    rating: { type: Number, required: true },
    goals: { type: Number, required: true },
    assists: { type: Number, required: true },
    minutes: { type: Number, required: true },
    isStarter: { type: Boolean, required: true }
}, { _id: false });

const TeamStatsSchema = new Schema({
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    players: [PlayerStatsSchema]
}, { _id: false });

const FullMatchStatsSchema = new Schema({
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
const MatchStatsSchema = new Schema<MatchStatsProps>({
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

const MatchStatsModel = AutoStatDbConnection.model<MatchStatsProps>('matchStats', MatchStatsSchema);

export { MatchStatsProps, MatchStatsModel };