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

  if (body.object === 'instagram' && body.entry) {
    for (const entry of body.entry) {
      // Instagram Messaging Webhooks use entry.messaging
      if (entry.messaging) {
        for (const event of entry.messaging) {
          // Ignore messages sent by our own bot (is_echo)
          if (event.message && !event.message.is_echo) {
            const senderId = event.sender.id;
            
            // Check if it's a story reply
            if (event.message.reply_to && event.message.reply_to.story) {
              handleStoryReply(senderId);
            } else {
              handleDM(senderId);         // Regular DM event
            }
          }
        }
      }
    }
  }
});

module.exports = router;
