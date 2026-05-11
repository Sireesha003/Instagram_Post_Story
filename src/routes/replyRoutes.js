// API endpoints for auto reply config
const express    = require('express');
const router     = express.Router();
const AutoReply  = require('../models/AutoReply');

// POST /api/autoreply/config — save or update auto reply settings
router.post('/config', async (req, res) => {
  const { dmReplyMessage, storyReplyMessage, isEnabled } = req.body;
  let config = await AutoReply.findOne();
  if (!config) config = new AutoReply();
  if (dmReplyMessage)    config.dmReplyMessage    = dmReplyMessage;
  if (storyReplyMessage) config.storyReplyMessage  = storyReplyMessage;
  if (isEnabled !== undefined) config.isEnabled   = isEnabled;
  config.updatedAt = new Date();
  await config.save();
  res.json({ message: 'Auto reply config saved!', config });
});

// GET /api/autoreply/config — view current config
router.get('/config', async (req, res) => {
  const config = await AutoReply.findOne();
  res.json(config || { message: 'No config set yet' });
});

module.exports = router;
