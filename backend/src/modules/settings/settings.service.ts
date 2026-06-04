import prisma from '../../config/prisma';
import { NotFoundError } from '../../utils/errors';

export async function getSettings() {
  const settings = await prisma.setting.findMany();
  const settingsMap: Record<string, string> = {};
  settings.forEach((s) => {
    settingsMap[s.key] = s.value;
  });
  return settingsMap;
}

export async function getSetting(key: string) {
  const setting = await prisma.setting.findUnique({ where: { key } });
  if (!setting) return { key, value: null };
  return setting;
}

export async function updateSetting(key: string, value: string) {
  return prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

export async function updateSettings(data: Record<string, string>) {
  const results = [];
  for (const [key, value] of Object.entries(data)) {
    const result = await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
    results.push(result);
  }
  return results;
}
