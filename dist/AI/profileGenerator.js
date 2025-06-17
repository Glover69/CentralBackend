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
exports.profileGeneratorRoutes = void 0;
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
exports.profileGeneratorRoutes = router;
const generative_ai_1 = require("@google/generative-ai");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) {
    console.error('Google API key is not set.');
    process.exit(1);
}
const genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
router.post('/generate-content', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let prompt = '';
        if (req.body.application === 'skeleton-loader') {
            prompt = req.body.prompt + 'generate a skeleton loader with this(using tailwind and making them animate-pulse). It should follow the same structure as the block of code given. No explanations. Just code.';
            if (req.body.framework === "Angular") {
                const rules = "Additional rules to note. If there are any blocks of code that are commented, take them out. If there are any stuff like formgroups, onclick functions, and the likes, take them out. All containers should be divs.";
                prompt = prompt + rules;
            }
        }
        else {
            prompt = req.body.prompt;
        }
        if (!prompt) {
            return res.status(400).send('Prompt is required');
        }
        console.log("Prompt: ", prompt);
        // For text-only input, use the gemini-pro model
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-001" });
        const result = yield model.generateContent(prompt);
        const response = yield result.response;
        const text = yield response.text();
        console.log(text);
        res.json({ content: text }); // Send the response as JSON
    }
    catch (error) {
        console.error('Error:', error);
        res.status(500).send('An error occurred');
    }
}));
