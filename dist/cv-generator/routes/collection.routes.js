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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.collectionRoutes = void 0;
const express_1 = __importDefault(require("express"));
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const dotenv = __importStar(require("dotenv"));
const collection_models_1 = require("../models/collection.models");
// import { nanoid } from 'nanoid'; 
// const { nanoid } = await import('nanoid');
dotenv.config();
// Configure AWS SDK
const s3 = new aws_sdk_1.default.S3({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    region: "eu-north-1",
});
const router = express_1.default.Router();
exports.collectionRoutes = router;
router.post("/:collectionID/add", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { collectionID } = req.params;
        const newFile = req.body;
        // if (!newFile.firstname || !newFile.lastname || !newFile.jobTitle || !newFile.profileImage) {
        //   return res.status(400).json({ message: "Missing required fields" });
        // }
        // Find the collection by ID and update it by pushing the new file to the files array
        const updatedCollection = yield collection_models_1.CollectionModel.findOneAndUpdate({ collectionID }, { $push: { files: newFile } }, { new: true });
        if (!updatedCollection) {
            return res.status(404).json({ message: "Collection not found" });
        }
        res.status(200).json(updatedCollection);
    }
    catch (error) {
        console.error("Error adding file to collection:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
