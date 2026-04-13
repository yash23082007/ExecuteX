// server/models/Snippet.js
const mongoose = require("mongoose");

const snippetSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  language: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
    maxlength: 50000, // 50KB max code size
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 7776000, // TTL: 90 days (auto-delete)
  },
});

module.exports = mongoose.model("Snippet", snippetSchema);
