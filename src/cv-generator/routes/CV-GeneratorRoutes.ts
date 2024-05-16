import express, { Request, Response } from "express";
const router = express.Router();
import axios from "axios";
import puppeteer from "puppeteer";

router.post('/generate-content', async (req: Request, res: Response) => {
    try {
        const googleApiKey = process.env.GOOGLE_API_KEY; // Make sure to set your Google API key as an environment variable
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${googleApiKey}`;
        
        const { text } = req.body;

        const requestBody = {
            contents: [{
                parts: [{
                    text
                }]
            }]
        };

        // Make a POST request to the Google Cloud API endpoint
        const response = await axios.post(apiUrl, requestBody, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Send the response from the API back to the client
        res.json(response.data);
    } catch (error: any) {
        console.error('Error:', error.response.data);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post("/html-to-pdf", async (req: Request, res: Response) => {
    // console.log('Request Body:', req.body);
  try {
    const { html } = req.body;

    // Check if html property exists in the request body
    if (!html) {
      return res.status(400).json({ error: "HTML content is required" });
    }

    // Launch a headless browser
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(60000);

    // Set the HTML content
    await page.setContent(html);

    // Generate PDF
    const pdfBuffer = await page.pdf();

    // Close the browser
    await browser.close();

    // Send the PDF as response
    res.setHeader("Content-Type", "application/pdf");
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error converting HTML to PDF:", error);
    res.status(500).json({ error: "Error converting HTML to PDF" });
  }
});

export { router as CVGeneratorRoutes };
