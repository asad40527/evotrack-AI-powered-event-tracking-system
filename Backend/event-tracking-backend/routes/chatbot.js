const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Chat = require("../models/Chat");
const Event = require("../models/Event");
const Sentiment = require("../models/Sentiment");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash-latest" });

// 🔹 Chatbot for user-entered questions
router.post("/chatbot", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, error: "Message text is required." });
    }

    const rawEvents = await Event.find().sort({ timestamp: -1 }).limit(30).lean();
    const rawSentiments = await Sentiment.find().sort({ timestamp: -1 }).limit(20).lean();

    const safeEvents = rawEvents.map(e => ({
      eventType: e.eventType,
      timestamp: e.timestamp,
      url: e.url,
      sessionId: e.sessionId,
      browser: e.browserData?.browser,
      platform: e.browserData?.platform,
      country: e.location?.country,
      city: e.location?.city,
    }));

    const safeSentiments = rawSentiments.map(s => ({
      sentiment: s.sentiment,
      score: s.score,
      timestamp: s.timestamp,
      text: s.text.slice(0, 100)
    }));

    const prompt = `
You are a data analytics assistant.

User's question: "${text}"

Here are the most recent 30 user interaction events:
${JSON.stringify(safeEvents, null, 2)}

Here are the most recent 20 sentiment analysis results:
${JSON.stringify(safeSentiments, null, 2)}

Based on the data, generate a clear, brief answer in natural language. 
If the question is general, answer based on common patterns in the provided data.
`;

    const response = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const botResponse = response.response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    await new Chat({
      userMessage: text,
      botResponse,
      modelUsed: "models/gemini-1.5-flash-latest",
      isSuccessful: true,
    }).save();

    res.json({ success: true, botResponse });
  } catch (error) {
    console.error("❌ Chatbot Error:", error.message);

    const fallbackResponse = "Sorry, I couldn't process that question. Please try again.";

    await new Chat({
      userMessage: req.body.text,
      botResponse: fallbackResponse,
      modelUsed: "models/gemini-1.5-flash-latest",
      isSuccessful: false,
      errorMessage: error.message,
    }).save();

    res.status(500).json({ success: false, botResponse: fallbackResponse });
  }
});

// 🔹 New route: Generate analytics report for download
router.post("/report", async (req, res) => {
  try {
    const rawEvents = await Event.find().sort({ timestamp: -1 }).limit(50).lean();
    const rawSentiments = await Sentiment.find().sort({ timestamp: -1 }).limit(30).lean();

    const safeEvents = rawEvents.map(e => ({
      eventType: e.eventType,
      timestamp: e.timestamp,
      url: e.url,
      browser: e.browserData?.browser,
      platform: e.browserData?.platform,
      country: e.location?.country,
      city: e.location?.city,
    }));

    const safeSentiments = rawSentiments.map(s => ({
      sentiment: s.sentiment,
      score: s.score,
      timestamp: s.timestamp,
      text: s.text.slice(0, 100)
    }));

    const prompt = `
You are an AI analyst. Create a structured weekly analytics report based on:

🔹 50 recent user interaction events:
${JSON.stringify(safeEvents, null, 2)}

🔹 30 recent sentiment records:
${JSON.stringify(safeSentiments, null, 2)}

Generate a clear, professional report including:
- Summary of activity trends
- Sentiment overview
- Browser/platform usage
- Engagement patterns
- One actionable insight

Format using markdown-like structure for clean formatting (e.g. headings, bullets).
`;

    const response = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const report = response.response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    res.json({ success: true, report });
  } catch (error) {
    console.error("❌ Report Error:", error.message);
    res.status(500).json({
      success: false,
      report: "Could not generate report. Please try again later.",
      error: error.message,
    });
  }
});

module.exports = router;
