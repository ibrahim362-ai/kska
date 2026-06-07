import { v2 as cloudinary } from 'cloudinary';
import { config } from '../../config';
import fs from 'fs';
import { BadRequestError } from '../../utils/errors';

// Only configure cloudinary if credentials are provided
if (config.cloudinary.cloudName && config.cloudinary.apiKey && config.cloudinary.apiSecret) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
  });
}

export async function uploadFile(file: Express.Multer.File) {
  if (!file) throw new BadRequestError('No file provided');

  // Use Cloudinary if configured, otherwise use local storage
  if (config.cloudinary.cloudName && config.cloudinary.apiKey && config.cloudinary.apiSecret) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'kska-platform',
        resource_type: 'auto',
      });

      // Delete local file after successful upload
      fs.unlink(file.path, () => {});

      return {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
      };
    } catch (error) {
      // If Cloudinary upload fails, fall back to local storage
      console.error('Cloudinary upload failed, using local storage:', error);
    }
  }

  // Local storage fallback
  return {
    url: `/uploads/${file.filename}`,
    publicId: file.filename,
    filename: file.filename,
    size: file.size,
  };
}
