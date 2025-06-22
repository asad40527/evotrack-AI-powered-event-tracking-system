const express = require('express');
const router = express.Router();
const generateAndSendReport = require('../cronJob');

router.post('/send-now', async (req, res) => {
  const email = req.body.email || 'admin@example.com';
  try {
    await generateAndSendReport(email);
    res.json({ success: true, message: `Report sent to ${email}` });
  } catch (err) {
    console.error("❌ Email Error:", err.message);
    res.status(500).json({ success: false, error: "Failed to send report." });
  }
});

module.exports = router;
