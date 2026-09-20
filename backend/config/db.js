import mongoose from 'mongoose';
import dns from 'dns';
import User from '../models/User.js';
import Category from '../models/Category.js';

// Fix Node.js DNS SRV resolution issues on Windows/ISPs
dns.setDefaultResultOrder('ipv4first');
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
  // Ignore if custom dns servers fail
}

const defaultCategories = [
  { name: 'Tops & Wearables', slug: 'tops-wearables', description: 'Handcrafted crochet tops, cardigans, and wearable fashion' },
  { name: 'Bags & Purses', slug: 'bags-purses', description: 'Crochet tote bags, shoulder bags, and coin purses' },
  { name: 'Flowers & Bouquets', slug: 'flowers-bouquets', description: 'Forever blooming crochet flowers and customized bouquets' },
  { name: 'Keychains & Charms', slug: 'keychains-charms', description: 'Cute handcrafted keychains, bag charms, and accessories' },
  { name: 'Toys & Plushies', slug: 'toys-plushies', description: 'Adorable amigurumi plushies and soft toys' },
];

const autoSeedAdmin = async () => {
  try {
    const adminEmail = (process.env.ADMIN_EMAIL || 'craftedknots25@gmail.com').toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || 'Ash@ad!09';
    const adminName = process.env.ADMIN_NAME || 'Uzma';

    let existingAdmin = await User.findOne({ email: adminEmail }).select('+password');

    if (!existingAdmin) {
      await User.create({
        name: adminName,
        email: adminEmail,
        phone: '9999999999',
        password: adminPassword,
        role: 'admin',
        isActive: true,
      });
      console.log(`👑 Fixed Owner Admin account created: ${adminEmail}`);
    } else {
      let isModified = false;
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        isModified = true;
      }
      if (adminPassword) {
        existingAdmin.password = adminPassword;
        isModified = true;
      }
      if (isModified) {
        await existingAdmin.save();
        console.log(`👑 Fixed Owner Admin account role & credentials updated: ${adminEmail}`);
      } else {
        console.log(`👑 Fixed Owner Admin account verified: ${adminEmail}`);
      }
    }
  } catch (err) {
    console.error(`⚠️ Admin auto-seed check warning: ${err.message}`);
  }
};

const autoSeedCategories = async () => {
  try {
    const count = await Category.countDocuments();
    if (count === 0) {
      await Category.insertMany(defaultCategories);
      console.log(`🌸 Default crochet categories auto-seeded (5 categories)`);
    }
  } catch (err) {
    console.error(`⚠️ Category auto-seed warning: ${err.message}`);
  }
};

let isConnected = false;

const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState >= 1) {
    isConnected = true;
    return;
  }
  if (!process.env.MONGODB_URI) {
    const errorMsg = 'MONGODB_URI environment variable is missing in Vercel settings!';
    console.error(`❌ ${errorMsg}`);
    throw new Error(errorMsg);
  }
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    await autoSeedAdmin().catch((e) => console.error('Auto-seed admin warning:', e.message));
    await autoSeedCategories().catch((e) => console.error('Auto-seed categories warning:', e.message));
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    throw new Error(`MongoDB connection error: ${error.message}. Check MONGODB_URI & Atlas Network Access (0.0.0.0/0).`);
  }
};

export default connectDB;
