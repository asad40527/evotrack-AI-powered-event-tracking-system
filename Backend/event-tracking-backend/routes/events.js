const express = require('express');
const router = express.Router();
const Event = require('../models/Event');

// POST route to track events
router.post('/track', async (req, res) => {
    const eventData = req.body; // Data sent from the frontend
    console.log('Received event data:', eventData); // Log the incoming data
    
    try {
      const event = new Event(eventData);
      await event.save(); // Save the event data to MongoDB
      res.status(201).json({ message: 'Event tracked', data: event });
    } catch (error) {
      console.error('Error tracking event:', error); // Log the error for debugging
      res.status(500).json({ message: 'Error tracking event', error });
    }
});
  

// Create a new event
router.post('/', async (req, res) => {
    try {
        const event = new Event(req.body);
        await event.save();
        res.status(201).json({ success: true, data: event });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get all events
router.get('/', async (req, res) => {
    try {
        const events = await Event.find();
        res.json({ success: true, data: events });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get event by ID
router.get('/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ success: false, error: 'Event not found' });
        }
        res.json({ success: true, data: event });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update event by ID
router.put('/:id', async (req, res) => {
    try {
        const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!event) {
            return res.status(404).json({ success: false, error: 'Event not found' });
        }
        res.json({ success: true, data: event });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete event by ID
router.delete('/:id', async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        if (!event) {
            return res.status(404).json({ success: false, error: 'Event not found' });
        }
        res.json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Analytics Routes
router.get('/device-counts', async (req, res) => {
    try {
        const data = await Event.aggregate([
            { $group: { _id: '$browserData.platform', count: { $sum: 1 } } }
        ]);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/browser-counts', async (req, res) => {
    try {
        const data = await Event.aggregate([
            { $group: { _id: '$browserData.browser', count: { $sum: 1 } } }
        ]);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// New endpoint to get hourly event counts (time distribution)
router.get('/time-distribution', async (req, res) => {
    try {
        // Aggregate events by the hour they occurred
        const timeData = await Event.aggregate([
            {
                $project: {
                    hour: { $hour: "$timestamp" }  // Extract the hour from timestamp
                }
            },
            {
                $group: {
                    _id: "$hour",    // Group by the hour
                    count: { $sum: 1 } // Count the events in each hour
                }
            },
            { $sort: { _id: 1 } }  // Sort by hour (ascending order)
        ]);

        // Return the time data as response
        res.json(timeData);
    } catch (error) {
        console.error("Error retrieving time distribution data:", error);
        res.status(500).json({ message: 'Error retrieving time distribution data', error });
    }
});

module.exports = router;
