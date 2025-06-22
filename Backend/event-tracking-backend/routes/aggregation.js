const express = require('express');
const router = express.Router();
const Event = require('../models/Event');

// Helper function for date filtering
const getDateFilter = (days) => {
    return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
};

// Endpoint to count each event type
router.get('/event-counts', async (req, res) => {
    try {
        const eventCounts = await Event.aggregate([
            { $group: { _id: "$eventType", count: { $sum: 1 } } }
        ]);
        res.json(eventCounts);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving event counts', error });
    }
});

// Endpoint to calculate average time spent on page
router.get('/average-time-spent', async (req, res) => {
    try {
        const avgTimeSpent = await Event.aggregate([
            { $group: { _id: null, averageTimeSpent: { $avg: "$timeSpent" } } }
        ]);
        res.json(avgTimeSpent[0] || { averageTimeSpent: 0 });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving average time spent', error });
    }
});

// Endpoint to count events by device type
router.get('/device-counts', async (req, res) => {
    try {
        const deviceCounts = await Event.aggregate([
            { 
                $group: { 
                    _id: { $ifNull: ["$browserData.platform", "Unknown"] },
                    count: { $sum: 1 } 
                } 
            }
        ]);
        res.json(deviceCounts);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving device counts', error });
    }
});

// Endpoint to count events by browser type
router.get('/browser-counts', async (req, res) => {
    try {
        const browserCounts = await Event.aggregate([
            { 
                $group: { 
                    _id: { $ifNull: ["$browserData.browser", "Unknown"] },
                    count: { $sum: 1 } 
                } 
            }
        ]);
        res.json(browserCounts);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving browser counts', error });
    }
});

// Endpoint to count events by referring source
router.get('/referring-sources', async (req, res) => {
    try {
        const referringSources = await Event.aggregate([
            { 
                $group: { 
                    _id: { $ifNull: ["$referringSource", "Direct"] },
                    count: { $sum: 1 } 
                } 
            }
        ]);
        res.json(referringSources);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving referring sources', error });
    }
});

// New Endpoint for hourly time distribution of events (Updated for time_spent events)
router.get('/time-distribution', async (req, res) => {
    try {
        const timeData = await Event.aggregate([
            // Filter only time_spent events
            { 
                $match: { 
                    eventType: 'time_spent' 
                }
            },
            {
                $project: {
                    day: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } }, // Extract the date
                    timeSpent: 1 // Keep the timeSpent field
                }
            },
            {
                $group: {
                    _id: "$day", // Group by day
                    totalTimeSpent: { $sum: "$timeSpent" } // Sum the timeSpent values for each day
                }
            },
            {
                $sort: { _id: 1 } // Sort by day in ascending order
            }
        ]);

        // Send the aggregated data back to the frontend
        res.json(timeData);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving time distribution data', error });
    }
});

// Event distribution aggregation
router.get('/event-distribution', async (req, res) => {
    try {
        const eventDistribution = await Event.aggregate([
            {
                $group: {
                    _id: '$eventType',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);
        res.json({ success: true, data: eventDistribution });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// User engagement aggregation
router.get('/user-engagement', async (req, res) => {
    try {
        const userEngagement = await Event.aggregate([
            {
                $group: {
                    _id: '$userId',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);
        res.json({ success: true, data: userEngagement });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// User activity aggregation
router.get('/user-activity', async (req, res) => {
    try {
        const userActivity = await Event.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);
        res.json({ success: true, data: userActivity });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
