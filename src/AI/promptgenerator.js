const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config;

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI("AIzaSyBH6Zb4uCGVfFxQUC-Hyejz0nerBZw3UCQ");

async function run() {
  // For text-only input, use the gemini-pro model
  const model = genAI.getGenerativeModel({ model: "gemini-pro"});

  const prompt = "I am a frontend. Give me about 3 interesting descriptions/bio"

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  console.log(text);
}

run();