const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema({
  userId: { type: String }, // Optional for now – will use later for personalized chat history

  userMessage: { type: String, required: true, trim: true }, // Natural language question
  botResponse: { type: String, required: true, trim: true }, // Final response shown to the user

  mongoQuery: { type: mongoose.Schema.Types.Mixed }, // Store Gemini-generated MongoDB query (raw JSON)
  queryResult: { type: mongoose.Schema.Types.Mixed }, // Store the raw data returned from MongoDB

  retrievedContext: { type: String, trim: true }, // (Optional) What context was pulled to help answer
  modelUsed: { type: String, required: true, default: "gemini-pro" }, // Updated model reference

  isSuccessful: { type: Boolean, default: true }, // Track query success/failure
  errorMessage: { type: String, trim: true }, // If Gemini failed to parse/query anything

  timestamp: { type: Date, default: Date.now } // Log when the chat happened
});

ChatSchema.index({ timestamp: -1 });

module.exports = mongoose.model("Chat", ChatSchema);
