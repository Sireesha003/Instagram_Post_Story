// All Instagram Graph API calls
const axios = require('axios');

const BASE_URL     = 'https://graph.facebook.com/v18.0';
const ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
const ACCOUNT_ID   = process.env.INSTAGRAM_ACCOUNT_ID;

// STEP 1: Create media container
async function createMediaContainer(mediaUrl, caption, mediaType) {
  const params = {
    access_token: ACCESS_TOKEN,
    caption
  };

  if (mediaType === 'IMAGE')  params.image_url  = mediaUrl;
  if (mediaType === 'REELS')  { params.video_url = mediaUrl; params.media_type = 'REELS'; }
  if (mediaType === 'STORIES') { params.image_url = mediaUrl; params.media_type = 'STORIES'; }

  const res = await axios.post(`${BASE_URL}/${ACCOUNT_ID}/media`, params);
  return res.data.id; // ← this is the container ID
}

// STEP 2: Publish the container
async function publishMedia(containerId) {
  const res = await axios.post(`${BASE_URL}/${ACCOUNT_ID}/media_publish`, {
    creation_id:  containerId,
    access_token: ACCESS_TOKEN
  });
  return res.data.id; // ← Instagram post ID
}

// SEND DM to a user
async function sendDM(userId, message) {
  await axios.post(`${BASE_URL}/me/messages`, {
    recipient:    { id: userId },
    message:      { text: message },
    access_token: ACCESS_TOKEN
  });
  console.log(`DM sent to userId: ${userId}`);
}

module.exports = { createMediaContainer, publishMedia, sendDM };
