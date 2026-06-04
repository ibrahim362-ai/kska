import { AuthRequest } from '../../middleware/auth';
import { Response, NextFunction } from 'express';
import * as uploadService from './upload.service';
import { sendSuccess } from '../../utils/apiResponse';

export async function uploadFile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await uploadService.uploadFile(req.file!);
    sendSuccess({ res, statusCode: 201, message: 'File uploaded', data: result });
  } catch (error) {
    next(error);
  }
}

export async function uploadFiles(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const files = req.files as Express.Multer.File[];
    const results = await Promise.all(files.map((f) => uploadService.uploadFile(f)));
    sendSuccess({ res, statusCode: 201, message: 'Files uploaded', data: results });
  } catch (error) {
    next(error);
  }
}
