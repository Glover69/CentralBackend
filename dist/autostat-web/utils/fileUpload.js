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
exports.uploadImage = void 0;
const multer_1 = __importDefault(require("multer"));
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const uuid_1 = require("uuid");
// dotenv.config();
const upload = (0, multer_1.default)();
// Configure AWS SDK
const s3 = new aws_sdk_1.default.S3({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    region: "eu-north-1",
});
// New Endpoint for Image Upload
exports.uploadImage = [upload.single("video"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const video = req.file;
            if (!video) {
                res.status(400).json({ message: "No file uploaded" });
                return;
            }
            let fileName;
            fileName = `users/${(0, uuid_1.v4)()}-${video.originalname}`;
            const params = {
                Bucket: "awsautostatbucket",
                Key: fileName,
                Body: video.buffer,
            };
            const uploadResult = yield s3.upload(params).promise();
            res.status(201).json({
                message: "Image uploaded successfully",
                imageUrl: uploadResult.Location,
            });
        }
        catch (error) {
            console.error("Error uploading image:", error);
            res.status(500).json({ message: "Error uploading image", error });
        }
    })];
