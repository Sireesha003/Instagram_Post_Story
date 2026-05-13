const express = require('express');
const router = express.Router();
const axios = require('axios');
const Account = require('../models/Account');

// POST /api/auth/instagram-connect
// This handles the token exchange after frontend redirect
router.post('/instagram-connect', async (req, res) => {
  const { accessToken, code } = req.body;
  const tokenToUse = accessToken || code;
  
  console.log('🔗 Received connection request with:', code ? 'Auth Code' : 'Access Token');

  if (!tokenToUse) {
    return res.status(400).json({ error: 'Access token or code is required' });
  }

  try {
    let finalToken = tokenToUse;

    // 1. If we received a code, exchange it for an access token first
    if (code) {
      console.log('🔄 Exchanging code for token...');
      const codeResponse = await axios.get(`https://graph.facebook.com/v19.0/oauth/access_token`, {
        params: {
          client_id: process.env.INSTAGRAM_APP_ID,
          client_secret: process.env.INSTAGRAM_APP_SECRET,
          redirect_uri: process.env.FB_REDIRECT_URI,
          code: code
        }
      });
      finalToken = codeResponse.data.access_token;
      console.log('✅ Code exchanged successfully');
    }

    // 2. Exchange for long-lived token
    console.log('⏳ Getting long-lived token...');
    const longLivedTokenResponse = await axios.get(`https://graph.facebook.com/v19.0/oauth/access_token`, {
      params: {
        grant_type: 'fb_exchange_token',
        client_id: process.env.INSTAGRAM_APP_ID,
        client_secret: process.env.INSTAGRAM_APP_SECRET,
        fb_exchange_token: finalToken
      }
    });

    const longLivedToken = longLivedTokenResponse.data.access_token;
    console.log('✅ Long-lived token acquired');

    // 3. Get User's Pages and Instagram Business Accounts
    console.log('🔍 Searching for Instagram Business accounts...');
    const pagesResponse = await axios.get(`https://graph.facebook.com/v19.0/me/accounts`, {
      params: { access_token: longLivedToken, fields: 'instagram_business_account,name' }
    });

    const pages = pagesResponse.data.data;
    console.log(`📡 Found ${pages.length} Facebook pages`);
    
    const connectedAccounts = [];

    for (const page of pages) {
      if (page.instagram_business_account) {
        const igId = page.instagram_business_account.id;
        console.log(`✨ Found Instagram Business Account: ${page.name} (${igId})`);
        
        // 4. Save or Update Account in Database
        const account = await Account.findOneAndUpdate(
          { instagramAccountId: igId },
          { 
            accessToken: longLivedToken, 
            instagramUsername: page.name,
            isConnected: true,
            lastSyncedAt: new Date()
          },
          { upsert: true, new: true }
        );
        connectedAccounts.push(account);
      }
    }

    if (connectedAccounts.length === 0) {
      console.log('⚠️ Warning: No Instagram Business Accounts were linked to these Facebook pages.');
    }

    res.json({ 
      success: true, 
      message: 'Account(s) connected successfully', 
      accounts: connectedAccounts 
    });

  } catch (error) {
    console.error('❌ Instagram Auth Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to connect Instagram account', details: error.response?.data });
  }
});

// GET /api/auth/status
// Check if any accounts are connected
router.get('/status', async (req, res) => {
  try {
    const account = await Account.findOne({ isConnected: true });
    res.json({ 
      isConnected: !!account,
      account: account ? {
        username: account.instagramUsername,
        lastSynced: account.lastSyncedAt
      } : null
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check connection status' });
  }
});

// GET /api/auth/accounts
// Get all connected accounts
router.get('/accounts', async (req, res) => {
  try {
    const accounts = await Account.find({ isConnected: true });
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch connected accounts' });
  }
});

module.exports = router;
