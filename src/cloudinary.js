import { v2 as cloudinary } from 'cloudinary';
import { AppError } from '../utils/http.js';
cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET, secure: true });
export async function uploadImage(file, folder = 'basma') {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) throw new AppError(503, 'خدمة رفع الصور غير مهيأة بعد', 'UPLOAD_NOT_CONFIGURED');
  const result = await cloudinary.uploader.upload(file.path, { folder, resource_type: 'image', transformation: [{ width: 2400, height: 2400, crop: 'limit' }] });
  return { url: result.secure_url, publicId: result.public_id };
}
