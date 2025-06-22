const axios = require("axios");
require("dotenv").config(); // contains GEMINI_API_KEY

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

  try {
    const response = await axios.get(url);
    console.log("✅ Available Models:");
    response.data.models.forEach((model) => {
      console.log(`- ${model.name}`);
    });
  } catch (error) {
    console.error("❌ Failed to fetch models:", error.response?.data?.error || error.message);
  }
}

listModels();
