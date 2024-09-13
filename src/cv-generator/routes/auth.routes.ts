import express from "express";
import { Request, Response } from "express";
import AWS from "aws-sdk";
import * as dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import { UserModel } from "../models/auth.models";
import { CollectionModel } from "../models/collection.models";
// import { nanoid } from 'nanoid'; 
// const { nanoid } = await import('nanoid');

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

    const newCollectionID = uuidv4();

    // const newCollectionID = nanoid(10);  // 10 characters long

    const userData = {
      email,
      isEmailVerified,
      fullname,
      profile,
      authID,
      customerID: uuidv4(),
      collectionID: newCollectionID  // Attach the collectionID to the user data
    };

    // Save the updated customer
    const savedUser = await UserModel.create(userData);


     // Create the new collection
     const collectionData = {
      collectionID: newCollectionID,
      customerID: savedUser.customerID,  // Link the collection to the user
      files: []  // Initialize with an empty array or provide initial files if needed
    };


    const savedCollection = await CollectionModel.create(collectionData);
    res.status(200).send({ message: "User added successfully", savedUser, savedCollection });

  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "An error occurred", error });
  }
});

router.get("/get-user/:authID", async (req: Request, res: Response) => {
try{
  const { authID } = req.params;

  const user = await UserModel.findOne({ authID });

  if(!user){
    return res.status(404).send({ message: "User not found" });
  }

  res.status(200).json(user);

}catch (error) {
  console.error('Error fetching user by authID:', error);
  res.status(500).json({ message: 'Internal server error' });
}
})

export { router as authRoutes };
