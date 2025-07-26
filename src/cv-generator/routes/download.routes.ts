import express from "express";
import { generatePDF } from "../controllers/download.controller";
const router = express.Router();


// Admin API's
router.post("/", generatePDF)



export default router;