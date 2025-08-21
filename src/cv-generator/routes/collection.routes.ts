import express from "express";
import { Request, Response } from "express";
import AWS from "aws-sdk";
import * as dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import { UserModel } from "../models/auth.models";
import { CollectionModel } from "../models/collection.models";
// import { nanoid } from 'nanoid'; 
// const { nanoid } = await import('nanoid');

// dotenv.config();

// Configure AWS SDK
const s3 = new AWS.S3({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: "eu-north-1",
});

const router = express.Router();

router.post("/:collectionID/add", async (req: Request, res: Response) => {
  try {
    const { collectionID } = req.params;
    const newFile = req.body;

    // if (!newFile.firstname || !newFile.lastname || !newFile.jobTitle || !newFile.profileImage) {
    //   return res.status(400).json({ message: "Missing required fields" });
    // }

    // Find the collection by ID and update it by pushing the new file to the files array
    const updatedCollection = await CollectionModel.findOneAndUpdate(
      { collectionID },
      { $push: { files: newFile } },
      { new: true }
    );

    if (!updatedCollection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    res.status(200).json(updatedCollection);
  } catch (error) {
    console.error("Error adding file to collection:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export { router as collectionRoutes };
