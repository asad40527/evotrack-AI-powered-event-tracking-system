require('dotenv').config(); // Load environment variables

const express = require('express');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const connectDB = require('./config/db');

// Route imports
const eventRoutes = require('./routes/events');
const aggregationRoutes = require('./routes/aggregation');
const aiRoutes = require('./routes/ai');
const authRoutes = require('./routes/auth');
const sentimentRoutes = require('./routes/sentimentRoutes');
const chatbotRoutes = require('./routes/chatbot');
const reportRoutes = require('./routes/reportRoutes'); // ✅ NEW: Report sending endpoint

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5001;

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from frontend
const frontendPath = path.join(__dirname, '../../Frontend/Frontend (Visuals and charts)');
console.log("📂 Serving static files from:", frontendPath);
app.use(express.static(frontendPath));

// API Routes
app.use('/api/events', eventRoutes);
app.use('/api/aggregation', aggregationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/sentiment', sentimentRoutes);
app.use('/api/chat', chatbotRoutes);
app.use('/api/report', reportRoutes); // ✅ NEW

// Serve sentiment chart file
app.get('/sentiment-chart', (req, res) => {
    res.sendFile(path.join(frontendPath, 'sentiment-chart/sentiment-chart.html'));
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'success',
        message: '✅ Event Tracking API is running',
        timestamp: new Date(),
    });
});

// Catch-all route
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// Debugging: Print registered routes
console.log("\n📌 Registered API Routes:");
app._router.stack.forEach((middleware) => {
    if (middleware.route) {
        console.log(`🔹 ${middleware.route.path}`);
    } else if (middleware.name === 'router') {
        middleware.handle.stack.forEach((nested) => {
            if (nested.route) {
                console.log(`🔹 ${nested.route.path}`);
            }
        });
    }
});

// // ✅ Optional: Auto-send weekly report using cron
// const cron = require('node-cron');
// const generateAndSendReport = require('./cronJob');

// // Schedule weekly report on Monday 08:00 (numeric day = 1)
// cron.schedule('0 8 * * 1', async () => {
//   console.log("📅 Running weekly EvoBot report...");
//   await generateAndSendReport('farmanalishar11@gmail.com');  // Fix typo in email if needed
// });

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 Server is running on port ${PORT}`);
});
