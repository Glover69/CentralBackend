import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { UserModel } from "../models/auth.models";

dotenv.config();



export const loginAdmin = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
  
    try {
      const user = await UserModel.findOne({ email: email });
  
      if (!user) {
        res.status(400).json({ error: "Email does't exist in our database" });
        return;
      }
  
      // Check password against the user's hashed password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        res.status(401).json({ error: "Invalid password" });
        return;
      }
  
  
      const token = jwt.sign(
        { id: user.userID, email: user.email },
        process.env.AUTOSTAT_JWT_SECRET!,
        { expiresIn: "1h" }
      );
      res.json({ token: token, admin: { email: user.email, firstName: user.firstName, lastName: user.lastName, organization: user.organization, userID: user.userID }, });
  
    } catch (error: any) {
      console.error("Login error:", error);
      res
        .status(500)
        .json({ message: "Unable to process login at this time", error: error });
    }
  };
  
  
  
  // Sign a new admin up
  export const signupAdmin = async (req: Request, res: Response): Promise<void> => {
    const { email, password, firstName, lastName, profile, organization } = req.body;
  
    // Check if user already exists
    const existingUser = await UserModel.findOne({ email: email });
  
    if (existingUser) {
        res.status(400).json({ error: "This email already exists. Try logging in instead" });
        return
    }
  
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const userID = `adm-${uuidv4()}`;
  
    // Structure for user's data
    const userData = {
        userID,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        profile,
        organization
    };
  
    // Save structure to database
    await UserModel.create(userData);
  
    // Generate verification token
    const token = jwt.sign({ email }, process.env.AUTOSTAT_JWT_SECRET!, { expiresIn: "1h" });
  
    res.status(201).json({
        message: "Onboarded user successfully.",
        admin: userData,
        token: token
    });
  }
  