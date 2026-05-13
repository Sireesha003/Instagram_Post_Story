// API endpoints for scheduling
const express = require('express');
const router  = express.Router();
const Post    = require('../models/Post');

// POST /api/posts/schedule — schedule a new post
router.post('/schedule', async (req, res) => {
  try {
    const { mediaUrl, caption, mediaType, scheduleTime, accountId } = req.body;
    if (!mediaUrl || !mediaType || !scheduleTime || !accountId)
      return res.status(400).json({ error: 'mediaUrl, mediaType, scheduleTime, and accountId are required' });
    const post = await Post.create({ mediaUrl, caption, mediaType, scheduleTime, accountId });
    res.status(201).json({ message: 'Post scheduled!', post });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/posts/all — see all scheduled posts
router.get('/all', async (req, res) => {
  const posts = await Post.find().sort({ scheduleTime: 1 });
  res.json(posts);
});

module.exports = router;
