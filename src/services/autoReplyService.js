// Auto reply logic
const AutoReply   = require('../models/AutoReply');
const { sendDM } = require('./instagramService');

// Handle incoming DM
async function handleDM(senderId) {
  try {
    const config = await AutoReply.findOne();
    if (!config || !config.isEnabled) {
      console.log('Auto reply is disabled or not configured');
      return;
    }
    // 2 second delay — avoids spam detection by Instagram
    setTimeout(async () => {
      await sendDM(senderId, config.dmReplyMessage);
      console.log(`Auto DM sent to ${senderId}`);
    }, 2000);
  } catch (error) {
    console.error('handleDM error:', error.message);
  }
}

// Handle story reply — sends a DM back to the person who replied
async function handleStoryReply(senderId) {
  try {
    const config = await AutoReply.findOne();
    if (!config || !config.isEnabled) return;
    setTimeout(async () => {
      await sendDM(senderId, config.storyReplyMessage);
      console.log(`Story auto reply sent to ${senderId}`);
    }, 2000);
  } catch (error) {
    console.error('handleStoryReply error:', error.message);
  }
}

module.exports = { handleDM, handleStoryReply };
