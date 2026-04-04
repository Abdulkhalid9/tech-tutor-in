require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

mongoose.connect(mongoUri).then(async () => {
  await User.create({
    name: 'Admin',
    email: 'admin@techtutorin.com',
    password: 'admin123',
    role: 'admin'
  });
  console.log('Admin created successfully');
  process.exit();
});
