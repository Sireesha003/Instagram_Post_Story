// Receives webhook events from Instagram
const express             = require('express');
const router              = express.Router();
const { handleDM, handleStoryReply } = require('../services/autoReplyService');

// GET /webhook/instagram — Meta uses this to verify your webhook URL
router.get('/', (req, res) => {
  const mode      = req.query['hub.mode'];
  const token     = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
    console.log('✅ Webhook verified by Meta!');
    res.status(200).send(challenge); // MUST send challenge back
  } else {
    res.status(403).send('Forbidden');
  }
});

// POST /webhook/instagram — receives real events from Instagram
router.post('/', (req, res) => {
  const body = req.body;
  res.status(200).send('EVENT_RECEIVED'); // Always respond 200 fast!

  if (body.entry) {
    for (const entry of body.entry) {
      for (const change of entry.changes || []) {
        const value = change.value;
        if (value.messages) {
          for (const msg of value.messages) {
            if (msg.story) {
              handleStoryReply(msg.from); // Story reply event
            } else {
              handleDM(msg.from);         // Regular DM event
            }
          }
        }
      }
    }
  }
});

module.exports = router;
