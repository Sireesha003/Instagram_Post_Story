require('dotenv').config();
const mongoose = require('mongoose');
const Account = require('./src/models/Account');

async function checkAccounts() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    const accounts = await Account.find({ isConnected: true });
    console.log('Connected Accounts:', JSON.stringify(accounts, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkAccounts();
