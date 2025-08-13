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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupRoutes = void 0;
// Import all route modules
const profileGenerator_1 = require("./AI/profileGenerator");
const auth_routes_1 = __importDefault(require("./cv-generator/routes/auth.routes"));
const collection_routes_1 = require("./cv-generator/routes/collection.routes");
const CV_GeneratorRoutes_1 = require("./cv-generator/routes/CV-GeneratorRoutes");
const download_routes_1 = __importDefault(require("./cv-generator/routes/download.routes"));
const review_routes_1 = __importDefault(require("./his-majesty/routes/review.routes"));
const auth_autostat_routes_1 = __importDefault(require("./autostat-web/routes/auth-autostat.routes"));
const match_process_routes_1 = __importDefault(require("./autostat-web/routes/match-process.routes"));
const autostat_utils_routes_1 = __importDefault(require("./autostat-web/routes/autostat-utils.routes"));
const setupRoutes = (app) => __awaiter(void 0, void 0, void 0, function* () {
    // Dynamically import Schedulr routes (these need database connections)
    const { default: GoogleAuthRoutes } = yield Promise.resolve().then(() => __importStar(require('./schedulr/routes/google-auth.routes')));
    const { default: SchedulrUserRoutes } = yield Promise.resolve().then(() => __importStar(require('./schedulr/routes/user.routes')));
    console.log('✅ Schedulr routes imported successfully');
    // CV Generator & AI routes
    app.use('/api/cv-generator', CV_GeneratorRoutes_1.CVGeneratorRoutes);
    app.use('/api/cv-gen/download', download_routes_1.default);
    app.use('/api/ai', profileGenerator_1.profileGeneratorRoutes);
    // Auth & Collections
    app.use('/api/auth', auth_routes_1.default);
    app.use('/api/collections', collection_routes_1.collectionRoutes);
    // Schedulr routes
    app.use('/api/schedulr/google-auth', GoogleAuthRoutes);
    app.use('/api/schedulr/user', SchedulrUserRoutes);
    console.log('✅ Schedulr routes registered at /api/schedulr/google-auth');
    // AutoStat routes
    app.use('/api/autostat-web/auth', auth_autostat_routes_1.default);
    app.use('/api/autostat-web/match-processes', match_process_routes_1.default);
    app.use('/api/autostat-web/utils', autostat_utils_routes_1.default);
    // Other services
    app.use('/api/his-majesty/reviews', review_routes_1.default);
    console.log('All routes have been set up successfully');
});
exports.setupRoutes = setupRoutes;
