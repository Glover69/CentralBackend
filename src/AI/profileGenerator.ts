import express, { Request, Response } from "express";
const router = express.Router();
import axios from "axios";
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();


const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) {
  console.error('Google API key is not set.');
  process.exit(1); 
}

const genAI = new GoogleGenerativeAI(apiKey);

router.post('/generate-content', async (req, res) => {
    try {

      let prompt = ''

      if(req.body.application === 'skeleton-loader'){
        prompt = req.body.prompt + 'generate a skeleton loader with this(using tailwind and making them animate-pulse). It should follow the same structure as the block of code given. No explanations. Just code.';
      }else{
        prompt = req.body.prompt;
      }

       if (!prompt) {
        return res.status(400).send('Prompt is required');
      }

      // For text-only input, use the gemini-pro model
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-001" });
    
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = await response.text();
      console.log(text);
  
      res.json({ content: text }); // Send the response as JSON
    } catch (error) {
      console.error('Error:', error);
      res.status(500).send('An error occurred');
    }
  });

  export { router as profileGeneratorRoutes };
