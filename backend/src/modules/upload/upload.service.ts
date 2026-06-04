import { v2 as cloudinary } from 'cloudinary';
import { config } from '../../config';
import fs from 'fs';
import { BadRequestError } from '../../utils/errors';

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

export async function uploadFile(file: Express.Multer.File) {
  if (!file) throw new BadRequestError('No file provided');

  if (config.cloudinary.cloudName) {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'community-platform',
      resource_type: 'auto',
    });

    fs.unlink(file.path, () => {});

    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
    };
  }

  return {
    url: `/uploads/${file.filename}`,
    filename: file.filename,
    size: file.size,
  };
}
