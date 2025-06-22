const mongoose = require('mongoose');

// Define the Event schema
const eventSchema = new mongoose.Schema({
    eventType: { 
        type: String, 
        required: true,
        enum: ['page_view', 'click', 'error', 'time_spent', 'form_submission', 'scroll'],
    },
    
    timestamp: { 
        type: Date, 
        default: Date.now,   // Automatically set to the current date/time
        index: true,          // Index for better query performance (especially for time-based queries)
    },
    
    // User interaction data
    url: { type: String },
    sessionId: { type: String },
    formFields: { type: Map, of: String },
    referringSource: { type: String },
    
    // Browser data with validation
    browserData: {
        browser: { type: String, required: true },
        platform: { type: String, required: true },
        screenResolution: { type: String },
        language: { type: String },
        userAgent: { type: String },
    },
    
    // Additional metadata
    ipAddress: { type: String },
    location: {
        country: { type: String },
        region: { type: String },
        city: { type: String },
        latitude: { type: Number },
        longitude: { type: Number },
    },

    element: { type: String },
    pageURL: { type: String },            // URL of the page where the event occurred
    scrollPosition: { type: Number },     // Current scroll position for scroll events
    maxScroll: { type: Number },          // Maximum scroll value for scroll events
});

// Create the Event model
const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
