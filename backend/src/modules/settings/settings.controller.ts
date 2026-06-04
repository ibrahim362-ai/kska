import { AuthRequest } from '../../middleware/auth';
import { Response, NextFunction } from 'express';
import * as settingsService from './settings.service';
import { sendSuccess } from '../../utils/apiResponse';

export async function getSettings(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const settings = await settingsService.getSettings();
    sendSuccess({ res, data: settings });
  } catch (error) {
    next(error);
  }
}

export async function getSetting(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const setting = await settingsService.getSetting(String(req.params.key));
    sendSuccess({ res, data: setting });
  } catch (error) {
    next(error);
  }
}

export async function updateSetting(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const setting = await settingsService.updateSetting(String(req.params.key), req.body.value);
    sendSuccess({ res, message: 'Setting updated', data: setting });
  } catch (error) {
    next(error);
  }
}

export async function updateSettings(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const settings = await settingsService.updateSettings(req.body);
    sendSuccess({ res, message: 'Settings updated', data: settings });
  } catch (error) {
    next(error);
  }
}
