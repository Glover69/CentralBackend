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
        userID: string; // Assuming userID is required
        title: string;
        date: string;
        duration?: string; // Optional
        videoURL?: string; // Optional
        description: string;
        isProcessed: boolean; // Will default to false
        focusOnMyTeam?: boolean; // Will default to false
        stats?: FullMatchStats | null; // The entire stats block is optional
    };
}

// --- Sub-schemas for better organization ---

const PlayerStatsSchema = new Schema({
    name: { type: String, required: false },
    position: { type: String, required: false },
    rating: { type: Number, required: false },
    goals: { type: Number, required: false },
    assists: { type: Number, required: false },
    minutes: { type: Number, required: false },
    isStarter: { type: Boolean, required: false }
}, { _id: false });

const TeamStatsSchema = new Schema({
    name: { type: String, required: false },
    rating: { type: Number, required: false },
    players: [PlayerStatsSchema]
}, { _id: false });

const FullMatchStatsSchema = new Schema({
    possession: {
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
const MatchStatsSchema = new Schema<MatchStatsProps>({
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

const MatchStatsModel = AutoStatDbConnection.model<MatchStatsProps>('matchStats', MatchStatsSchema);

export { MatchStatsProps, MatchStatsModel };