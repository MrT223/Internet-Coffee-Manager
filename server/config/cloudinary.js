import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Storage cho avatar người dùng
const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'CyberOps_Avatars',
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'gif'],
      transformation: [{ width: 200, height: 200, crop: 'fill', gravity: 'face' }],
    };
  },
});

// Storage cho menu items (đồ ăn, thức uống)
const menuStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'CyberOps_Menu',
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
      transformation: [{ width: 500, height: 500, crop: 'fill' }],
    };
  },
});

// Middleware upload
export const uploadAvatar = multer({ storage: avatarStorage });
export const uploadMenuItem = multer({ storage: menuStorage });

// Helper function để xóa ảnh cũ trên Cloudinary
export const deleteFromCloudinary = async (imageUrl) => {
  if (!imageUrl) return;
  
  try {
    // Extract public_id từ URL
    const urlParts = imageUrl.split('/');
    const folderAndFile = urlParts.slice(-2).join('/'); // e.g., "CyberOps_Avatars/abc123"
    const publicId = folderAndFile.split('.')[0]; // Remove file extension
    
    await cloudinary.uploader.destroy(publicId);
    console.log('✅ Deleted old image from Cloudinary:', publicId);
  } catch (error) {
    console.error('❌ Error deleting image from Cloudinary:', error);
  }
};

export default cloudinary;
