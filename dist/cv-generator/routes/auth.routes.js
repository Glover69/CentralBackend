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
exports.authRoutes = void 0;
const express_1 = __importDefault(require("express"));
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const dotenv = __importStar(require("dotenv"));
const uuid_1 = require("uuid");
const auth_models_1 = require("../models/auth.models");
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
exports.authRoutes = router;
router.post("/add-user", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, isEmailVerified, fullname, profile, authID, customerID } = req.body.user;
    console.log(req.body);
    try {
        const existingUser = yield auth_models_1.UserModel.findOne({ authID: authID });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }
        const newCollectionID = (0, uuid_1.v4)();
        // const newCollectionID = nanoid(10);  // 10 characters long
        const userData = {
            email,
            isEmailVerified,
            fullname,
            profile,
            authID,
            customerID: (0, uuid_1.v4)(),
            collectionID: newCollectionID // Attach the collectionID to the user data
        };
        // Save the updated customer
        const savedUser = yield auth_models_1.UserModel.create(userData);
        // Create the new collection
        const collectionData = {
            collectionID: newCollectionID,
            customerID: savedUser.customerID, // Link the collection to the user
            files: [] // Initialize with an empty array or provide initial files if needed
        };
        const savedCollection = yield collection_models_1.CollectionModel.create(collectionData);
        res.status(200).send({ message: "User added successfully", savedUser, savedCollection });
    }
    catch (error) {
        console.error(error);
        res.status(500).send({ message: "An error occurred", error });
    }
}));
router.get("/get-user/:authID", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { authID } = req.params;
        const user = yield auth_models_1.UserModel.findOne({ authID });
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }
        res.status(200).json(user);
    }
    catch (error) {
        console.error('Error fetching user by authID:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));
