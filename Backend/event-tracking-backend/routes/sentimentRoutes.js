const express = require('express');
const router = express.Router();
const axios = require('axios');
const Sentiment = require('../models/Sentiment'); // Import the Sentiment model
require('dotenv').config(); // Ensure dotenv is loaded

// Verify token exists
if (!process.env.HUGGING_FACE_TOKEN) {
    console.error('HUGGING_FACE_TOKEN not found in environment variables');
    process.exit(1);
}

// Map labels returned by twitter-roberta-base-sentiment model
const labelMap = {
  LABEL_0: 'NEGATIVE',
  LABEL_1: 'NEUTRAL',
  LABEL_2: 'POSITIVE'
};

// Define the sentiment analysis route
router.post('/analyze', async (req, res) => {
    try {
        const { text } = req.body;

        if (!text || typeof text !== 'string' || !text.trim()) {
            return res.status(400).json({ success: false, error: 'Invalid input text' });
        }

        console.log('📥 Received text:', text);

        const hfResponse = await axios.post(
            'https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment',
            { inputs: text },
            {
                headers: {
                    Authorization: `Bearer ${process.env.HUGGING_FACE_TOKEN}`,
                },
            }
        );

        console.log('📦 Hugging Face response:', hfResponse.data);

        // Extract sentiment data and map label
        const sentimentData = hfResponse.data[0][0];
        const sentiment = labelMap[sentimentData.label] || sentimentData.label;
        const score = sentimentData.score;

        const newSentiment = new Sentiment({ text, sentiment, score });
        await newSentiment.save();

        console.log('✅ Data stored successfully');
        res.json({ success: true, message: 'Data stored successfully', data: hfResponse.data });

    } catch (error) {
        console.error('❌ Error in /analyze:', error.response?.data || error.message || error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Define the route to fetch sentiment data
router.get('/data', async (req, res) => {
    try {
        const sentimentData = await Sentiment.find().sort({ timestamp: -1 }); // Fetch all records
        console.log('Fetched sentiment data:', sentimentData); // Log the fetched data
        res.json({ success: true, data: sentimentData });
    } catch (error) {
        console.error('Error:', error); // Log the error
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
