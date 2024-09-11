import express from "express";
import { Request, Response } from "express";
import AWS from "aws-sdk";
import * as dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import { UserModel } from "../models/auth.models";
dotenv.config();

// Configure AWS SDK
const s3 = new AWS.S3({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: "eu-north-1",
});

const router = express.Router();

router.post("/add-user", async (req: Request, res: Response) => {
  const { email, isEmailVerified, fullname, profile, authID, customerID } =
    req.body.user;
  console.log(req.body);

   

  try {
    const existingUser = await UserModel.findOne({ authID: authID });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const userData = {
      email,
      isEmailVerified,
      fullname,
      profile,
      authID,
      customerID: uuidv4(),
    };

    // Save the updated customer
    const savedUser = await UserModel.create(userData);
    res.status(200).send({ message: "User added successfully", savedUser });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "An error occurred", error });
  }
});

export { router as authRoutes };
