// MongoDB schema for auto reply config
const mongoose = require('mongoose');

const AutoReplySchema = new mongoose.Schema({
  dmReplyMessage: {
    type: String,
    default: 'Thanks for your message! We will get back to you soon.'
  },
  storyReplyMessage: {
    type: String,
    default: 'Thanks for replying to our story!'
  },
  isEnabled:  { type: Boolean, default: true },
  updatedAt:  { type: Date, default: Date.now }
});

module.exports = mongoose.model('AutoReply', AutoReplySchema);
