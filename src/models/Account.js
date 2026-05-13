const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema({
  platform: { type: String, default: 'instagram' },
  instagramAccountId: { type: String, required: true },
  instagramUsername: { type: String },
  accessToken: { type: String, required: true }, // Long-lived access token
  expiresAt: { type: Date },
  isConnected: { type: Boolean, default: true },
  lastSyncedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Account', AccountSchema);
