import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const name = process.env.ADMIN_NAME || 'Crafted Knots Admin';

    if (!email || !password) {
      console.error('❌ ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env');
      process.exit(1);
    }

    const existing = await User.findOne({ email });
    if (existing) {
      console.log(`⚠️  Admin already exists: ${email}`);
      process.exit(0);
    }

    await User.create({ name, email, phone: '9999999999', password, role: 'admin' });
    console.log(`✅ Admin account created: ${email}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

seedAdmin();
