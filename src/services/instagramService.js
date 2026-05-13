// All Instagram Graph API calls
const axios = require('axios');

const BASE_URL = 'https://graph.facebook.com/v18.0';

// STEP 1: Create media container
async function createMediaContainer(mediaUrl, caption, mediaType, accessToken, instagramAccountId) {
  const params = {
    access_token: accessToken,
    caption
  };

  if (mediaType === 'IMAGE')  params.image_url  = mediaUrl;
  if (mediaType === 'REELS')  { params.video_url = mediaUrl; params.media_type = 'REELS'; }
  if (mediaType === 'STORIES') { params.image_url = mediaUrl; params.media_type = 'STORIES'; }

  const res = await axios.post(`${BASE_URL}/${instagramAccountId}/media`, params);
  return res.data.id; // ← this is the container ID
}

// STEP 2: Publish the container
async function publishMedia(containerId, accessToken, instagramAccountId) {
  const res = await axios.post(`${BASE_URL}/${instagramAccountId}/media_publish`, {
    creation_id:  containerId,
    access_token: accessToken
  });
  return res.data.id; // ← Instagram post ID
}

// SEND DM to a user
async function sendDM(userId, message, accessToken) {
  await axios.post(`${BASE_URL}/me/messages`, {
    recipient:    { id: userId },
    message:      { text: message },
    access_token: accessToken
  });
  console.log(`DM sent to userId: ${userId}`);
}

module.exports = { createMediaContainer, publishMedia, sendDM };
