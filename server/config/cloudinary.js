import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// --- DEBUG LOGGING FOR CLOUDINARY CONFIG ---
console.log("============== CLOUDINARY CONFIG DEBUG ==============");
console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME || "MISSING");
console.log("API Key:", process.env.CLOUDINARY_API_KEY ? "Loaded OK" : "MISSING");
console.log("API Secret:", process.env.CLOUDINARY_API_SECRET ? "Loaded OK" : "MISSING");
console.log("====================================================");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Storage cho avatar
const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'CyberOps_Avatars',
    resource_type: 'auto',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});

const menuStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'CyberOps_Menu',
    resource_type: 'auto', 
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});

// Middleware xử lý lỗi Multer ngay tại chỗ
const uploadAvatar = multer({ storage: avatarStorage });
const uploadMenuItem = multer({ storage: menuStorage });

export { uploadAvatar, uploadMenuItem, cloudinary };

// Helper xóa ảnh
export const deleteFromCloudinary = async (imageUrl) => {
  if (!imageUrl) return;
  try {
    const urlParts = imageUrl.split('/');
    const folderAndFile = urlParts.slice(-2).join('/');
    const publicId = folderAndFile.split('.')[0];
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting image:', error);
  }
};

export default cloudinary;