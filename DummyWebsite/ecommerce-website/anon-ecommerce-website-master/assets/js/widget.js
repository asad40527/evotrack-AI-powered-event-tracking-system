// Function to send event data to the backend
function sendEventData(eventData) {
    // Add browser and device information
    const browserData = {
        browser: navigator.userAgent, // Detailed browser info
        platform: navigator.platform  // Platform (e.g., "Win32" for Windows)
    };

    // Add referring source
    const referringSource = document.referrer || "Direct"; // Defaults to "Direct" if no referrer

    // Combine the additional data with the event data
    const fullEventData = {
        ...eventData,          // Original event data (e.g., clicks, scrolls)
        browserData,           // Browser and device info
        referringSource        // Referring source info
    };

    // Log the full data to check what's being sent
    console.log("Sending event data:", fullEventData);

    // Send the combined data to the backend
    fetch('http://localhost:5001/api/events/track',
     {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(fullEventData),
    })
    .then(response => response.json())
    .then(data => console.log('Response from backend:', data))
    .catch(error => console.error('Error sending event:', error));
}

// Track click events
document.addEventListener('click', function(event) {
    const eventData = {
        eventType: 'click',
        element: event.target.tagName,
        timestamp: new Date().toISOString(),
    };
    sendEventData(eventData);
});

// Track scroll events
window.addEventListener('scroll', function() {
    const scrollPosition = window.scrollY;
    const maxScroll = document.body.scrollHeight - window.innerHeight;

    const eventData = {
        eventType: 'scroll',
        scrollPosition,
        maxScroll,
        timestamp: new Date().toISOString(),
    };
    sendEventData(eventData);
});

// Track form submissions
document.addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent page reload for testing
    const formData = new FormData(event.target);
    const formObject = {};
    formData.forEach((value, key) => formObject[key] = value);

    const eventData = {
        eventType: 'form_submission',
        formFields: formObject,
        timestamp: new Date().toISOString(),
    };
    sendEventData(eventData);
});

// Track time spent on page
const sessionStartTime = new Date();

setInterval(function() {
    const timeSpentSeconds = Math.floor((new Date() - sessionStartTime) / 1000);
    const eventData = {
        eventType: 'time_spent',
        timeSpent: timeSpentSeconds,
        timestamp: new Date().toISOString(),
    };
    sendEventData(eventData);
}, 10000); // Send every 10 seconds
