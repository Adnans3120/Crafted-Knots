import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

const isCloudinaryConfigured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'demo' &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_KEY !== '123456789';

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

let storage;

if (isCloudinaryConfigured) {
  storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'crafted-knots/products',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 1200, quality: 'auto', fetch_format: 'auto' }],
    },
  });
} else {
  storage = multer.memoryStorage();
}

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, 
});

export default cloudinary;
