"use strict";
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
exports.addMatchProcess = exports.getSpecificMatchProcess = exports.getAllMatchProcesses = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const match_process_models_1 = require("../models/match-process.models");
const uuid_1 = require("uuid");
dotenv_1.default.config();
exports.getAllMatchProcesses = [auth_middleware_1.conditionalAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const matchProcesses = yield match_process_models_1.MatchStatsModel.find();
            res.status(200).json(matchProcesses);
        }
        catch (error) {
            console.error("Error fetching match processes:", error);
            res.status(500).json({ message: "Error fetching match processes", error });
        }
    })];
// Endpoint to get a specific match process using their ID
exports.getSpecificMatchProcess = [auth_middleware_1.conditionalAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.query;
        if (!id) {
            res.status(400).json({ message: "Please provide the match process's ID." });
            return;
        }
        try {
            const matchProcess = yield match_process_models_1.MatchStatsModel.findOne({ 'match.id': id });
            if (!matchProcess) {
                res.status(404).json({ message: `Could not find match process with ID ${id}` });
                return;
            }
            else {
                res.status(200).json(matchProcess);
            }
        }
        catch (error) {
            console.error("Error getting a specific match process:", error);
            res.status(500).json({ message: "Unable to process getting the specific match process at this time", error: error });
        }
    })];
// Endpoint to add a product (Manual Input through process)
// export const addMatchProcess = [authMiddleware, async (req: Request, res: Response): Promise<void> => { 
//     const {
//         productImage,
//         subImages,
//         status,
//         productName,
//         ingredients,
//         ingredientsChips,
//         preparation,
//         productPrice,
//         hasSizes,
//         variations,
//         productID,
//       } = req.body;
//       // Basic validation for required fields
//     if (!productImage || !status || !productName || !ingredients || !productID) {
//         res.status(400).json({ message: "Missing required product fields." });
//         return;
//     }
//     try {
//         const newProduct = new ProductModel({
//           productImage,
//           subImages: subImages || [],
//           status,
//           productName,
//           ingredients,
//           ingredientsChips: ingredientsChips || [],
//           preparation: preparation || [],
//           productPrice: variations[0].price || productPrice,
//           hasSizes: hasSizes || false,
//           variations: variations || [],
//           productID,
//         });
//         const savedProduct = await newProduct.save();
//         res.status(201).json({
//           message: "Product added successfully.",
//           product: savedProduct,
//         });
//       } catch (error) {
//         console.error("Error adding product: ", error);
//         res.status(500).json({ message: "Could not process adding new product at this time", error: error });
//       }
// }]
exports.addMatchProcess = [auth_middleware_1.conditionalAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        // The request body is expected to match the MatchStatsModel schema.
        const matchData = req.body;
        // Basic validation can be handled by Mongoose schema 'required' fields.
        // This check is still good as a first line of defense.
        if (!matchData.match || !matchData.match.title || !matchData.match.videoURL) {
            res.status(400).json({ message: "Missing required match process fields." });
            return;
        }
        try {
            const matchID = `match-${(0, uuid_1.v4)()}`;
            const currentDate = new Date().toISOString();
            // Add the generated id and date to the match data object
            matchData.match.id = matchID;
            matchData.match.date = currentDate;
            matchData.match.isProcessed = false; // Default to false when adding a new match process
            matchData.match.stats = matchData.match.stats || {}; // Ensure stats is an object, even if empty
            // It's good practice to check if a resource with this unique ID already exists
            const existingMatch = yield match_process_models_1.MatchStatsModel.findOne({ id: matchData.match.id });
            if (existingMatch) {
                res.status(409).json({ message: `A match process with ID ${matchData.match.id} already exists.` }); // 409 Conflict
                return;
            }
            // Pass the entire request body to the model constructor.
            // Mongoose will map the fields that are defined in the schema.
            const newMatchProcess = new match_process_models_1.MatchStatsModel(matchData);
            const savedMatchProcess = yield newMatchProcess.save();
            res.status(201).json({
                message: "Match process added successfully.",
                matchProcess: savedMatchProcess,
            });
        }
        catch (error) {
            // Handle Mongoose validation errors specifically
            if (error.name === 'ValidationError') {
                res.status(400).json({ message: "Validation Error", error: error.message });
                return;
            }
            console.error("Error adding match process: ", error);
            res.status(500).json({ message: "Could not process adding new match process at this time", error: error });
        }
    })];
