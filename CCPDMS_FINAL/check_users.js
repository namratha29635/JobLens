require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 })
  .then(async () => {
    console.log('Connected to DB');
    const allUsers = await User.find({}).select('+password');
    console.log('ALL USERS IN DB:', allUsers.map(u => ({
      email: u.email,
      role: u.role,
      isFirstLogin: u.isFirstLogin,
      isActive: u.isActive,
    })));

    // Ensure coordinator has isFirstLogin: false and correct password
    const coord = await User.findOne({ email: 'coordinator@college.edu' });
    if (coord) {
      coord.isFirstLogin = false;
      coord.isActive = true;
      coord.password = 'Test@123';
      await coord.save();
      console.log('Updated coordinator@college.edu password to Test@123, isFirstLogin: false');
    } else {
      await User.create({
        email: 'coordinator@college.edu',
        password: 'Test@123',
        role: 'coordinator',
        isFirstLogin: false,
        isActive: true,
      });
      console.log('Created coordinator@college.edu with Test@123');
    }

    const stu = await User.findOne({ email: 'student@college.edu' });
    if (stu) {
      stu.isFirstLogin = false;
      stu.isActive = true;
      stu.password = 'Test@123';
      await stu.save();
      console.log('Updated student@college.edu password to Test@123, isFirstLogin: false');
    }

    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
