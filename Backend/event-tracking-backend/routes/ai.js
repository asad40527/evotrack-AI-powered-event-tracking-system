const express = require('express');
const router = express.Router();
const { HfInference } = require('@huggingface/inference');

// Verify token exists
if (!process.env.HUGGING_FACE_TOKEN) {
    console.error('HUGGING_FACE_TOKEN not found in environment variables');
    process.exit(1);
}

const hf = new HfInference(process.env.HUGGING_FACE_TOKEN);

router.post('/analyze', async (req, res) => {
    try {
        console.log('Request body:', req.body); // Debug log

        const { text, model = "gpt2" } = req.body;
        
        if (!text) {
            return res.status(400).json({
                status: 'error',
                message: 'Text input is required'
            });
        }

        console.log('Calling Hugging Face API...'); // Debug log
        const response = await hf.textGeneration({
            model,
            inputs: text,
            parameters: {
                max_new_tokens: 50,
                temperature: 0.7
            }
        });

        console.log('Hugging Face API response:', response); // Debug log
        res.json({
            status: 'success',
            data: response
        });
    } catch (error) {
        console.error('Error analyzing text:', error); // Debug log
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

module.exports = router;