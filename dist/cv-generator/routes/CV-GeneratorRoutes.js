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
exports.CVGeneratorRoutes = void 0;
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
exports.CVGeneratorRoutes = router;
const axios_1 = __importDefault(require("axios"));
const puppeteer_1 = __importDefault(require("puppeteer"));
router.post('/generate-content', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const response = yield axios_1.default.post(apiUrl, requestBody, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        // Send the response from the API back to the client
        res.json(response.data);
    }
    catch (error) {
        console.error('Error:', error.response.data);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));
router.post("/html-to-pdf", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log('Request Body:', req.body);
    try {
        const { html } = req.body;
        // Check if html property exists in the request body
        if (!html) {
            return res.status(400).json({ error: "HTML content is required" });
        }
        // Launch a headless browser
        const browser = yield puppeteer_1.default.launch();
        const page = yield browser.newPage();
        yield page.setDefaultNavigationTimeout(60000);
        // Set the HTML content
        yield page.setContent(html);
        // Generate PDF
        const pdfBuffer = yield page.pdf();
        // Close the browser
        yield browser.close();
        // Send the PDF as response
        res.setHeader("Content-Type", "application/pdf");
        res.send(pdfBuffer);
    }
    catch (error) {
        console.error("Error converting HTML to PDF:", error);
        res.status(500).json({ error: "Error converting HTML to PDF" });
    }
}));
