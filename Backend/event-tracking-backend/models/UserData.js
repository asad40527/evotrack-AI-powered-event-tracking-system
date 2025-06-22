const mongoose = require("mongoose");

const UserDataSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true }, // Unique User ID
    sentiments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Sentiment" }], // Related Sentiments
    events: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }], // User interactions
    recentChats: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chat" }], // Recent chat history
});

module.exports = mongoose.model("UserData", UserDataSchema);
