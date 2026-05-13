// Main entry point
require('dotenv').config();
const express          = require('express');
const mongoose         = require('mongoose');
const postRoutes       = require('./routes/postRoutes');
const replyRoutes      = require('./routes/replyRoutes');
const webhookRoutes    = require('./routes/webhookRoutes');
const authRoutes       = require('./routes/authRoutes');
const { startScheduler } = require('./scheduler/postScheduler');

const app = express();
app.use(express.json());

// CORS Middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});


app.use('/api/posts',     postRoutes);
app.use('/api/autoreply', replyRoutes);
app.use('/api/auth',      authRoutes);
app.use('/webhook/instagram', webhookRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    startScheduler();
    app.listen(process.env.PORT || 5000, () =>
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));
