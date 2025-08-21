import { Request, Response } from "express";
import dotenv from "dotenv";
import { authMiddleware, conditionalAuth } from "../middlewares/auth.middleware";
// import { MatchStatsModel } from "../models/match-process.models";
import { v4 as uuidv4 } from "uuid";
import { getMatchStatsModel } from "../models/match-process.models";

// dotenv.config();


export const getAllMatchProcesses = [conditionalAuth, async (req: any, res: any): Promise<void> => {
    try {
        const MatchStatsModel = getMatchStatsModel();
        const matchProcesses = await MatchStatsModel.find();
        res.status(200).json(matchProcesses);
    } catch (error) {
        console.error("Error fetching match processes:", error);
        res.status(500).json({ message: "Error fetching match processes", error });
    }
}]


// Endpoint to get a specific match process using their ID
export const getSpecificMatchProcess = [conditionalAuth, async (req: Request, res: Response ): Promise<void> => {
    const { id } = req.query;

    if(!id){
        res.status(400).json({ message: "Please provide the match process's ID." });
        return;
    }

    try {
        const MatchStatsModel = getMatchStatsModel();
        const matchProcess = await MatchStatsModel.findOne({ 'match.id': id});

        if(!matchProcess){
            res.status(404).json({ message: `Could not find match process with ID ${id}` });
            return;
        }else{
            res.status(200).json(matchProcess);
        }

        
    } catch (error) {
        console.error("Error getting a specific match process:", error);
        res.status(500).json({ message: "Unable to process getting the specific match process at this time", error: error });
    }
}]



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


export const addMatchProcess = [conditionalAuth, async (req: Request, res: Response): Promise<void> => { 
    // The request body is expected to match the MatchStatsModel schema.
    const matchData = req.body;

    // Basic validation can be handled by Mongoose schema 'required' fields.
    // This check is still good as a first line of defense.
    if (!matchData.match || !matchData.match.title || !matchData.match.videoURL) {
        res.status(400).json({ message: "Missing required match process fields." });
        return;
    }

    try {

        const matchID = `match-${uuidv4()}`;
        const currentDate = new Date().toISOString();

        // Add the generated id and date to the match data object
        matchData.match.id = matchID;
        matchData.match.date = currentDate;
        matchData.match.isProcessed = false; // Default to false when adding a new match process
        matchData.match.stats = matchData.match.stats || {}; // Ensure stats is an object, even if empty

        // It's good practice to check if a resource with this unique ID already exists
        const MatchStatsModel = getMatchStatsModel();
        const existingMatch = await MatchStatsModel.findOne({ id: matchData.match.id });
        if (existingMatch) {
            res.status(409).json({ message: `A match process with ID ${matchData.match.id} already exists.` }); // 409 Conflict
            return;
        }

        // Pass the entire request body to the model constructor.
        // Mongoose will map the fields that are defined in the schema.
        const newMatchProcess = new MatchStatsModel(matchData);

        const savedMatchProcess = await newMatchProcess.save();

        res.status(201).json({
            message: "Match process added successfully.",
            matchProcess: savedMatchProcess,
        });
    } catch (error: any) {
        // Handle Mongoose validation errors specifically
        if (error.name === 'ValidationError') {
            res.status(400).json({ message: "Validation Error", error: error.message });
            return
        }
        console.error("Error adding match process: ", error);
        res.status(500).json({ message: "Could not process adding new match process at this time", error: error });
    }
}]