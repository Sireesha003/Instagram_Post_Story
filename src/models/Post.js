// MongoDB schema for scheduled posts
const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  mediaUrl:     { type: String, required: true },  // image or video URL (must be public)
  caption:      { type: String, default: '' },
  mediaType: {
    type: String,
    enum: ['IMAGE', 'VIDEO', 'REELS', 'STORIES'],
    required: true
  },
  scheduleTime: { type: Date, required: true },   // when to auto-publish
  status: {
    type: String,
    enum: ['SCHEDULED', 'PUBLISHED', 'FAILED'],
    default: 'SCHEDULED'
  },
  instagramPostId: { type: String },               // returned after successful publish
  errorMessage:    { type: String },               // stored if publish fails
  createdAt:       { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', PostSchema);
