require('dotenv').config();
const mongoose = require('mongoose');
module.exports = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(global.styles.infoColor('✅ Connected to MongoDB'));
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
  }
};
