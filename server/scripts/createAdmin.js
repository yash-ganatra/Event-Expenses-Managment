// server/scripts/createAdmin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

mongoose.connect(process.env.MONGO_URL).then(async () => {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await User.create({
    name: 'Admin',
    team: 'AdminTeam',
    email: 'admin@example.com',
    password: hashedPassword,
    isAdmin: true
  });
  console.log('Admin created');
  process.exit();
});
