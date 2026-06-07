import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'fallback-access-secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
    accessExpires: process.env.JWT_ACCESS_EXPIRES || '15m',
    refreshExpires: process.env.JWT_REFRESH_EXPIRES || '7d',
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },

  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'KSKA <noreply@localhost>',
  },

  manualPayment: {
    instructions:
      process.env.MANUAL_PAYMENT_INSTRUCTIONS ||
      'Pay the exact amount to one of the accounts below, then upload your payment receipt (screenshot or PDF).',
    bankName: process.env.MANUAL_PAYMENT_BANK_NAME || 'Commercial Bank of Ethiopia',
    accountNumber: process.env.MANUAL_PAYMENT_ACCOUNT_NUMBER || '1000000000000',
    accountHolder: process.env.MANUAL_PAYMENT_ACCOUNT_HOLDER || 'KSKA PLC',
    telebirrNumber: process.env.MANUAL_PAYMENT_TELEBIRR_NUMBER || '0911000000',
    awashAccount: process.env.MANUAL_PAYMENT_AWASH_ACCOUNT || '0130000000000',
  },

  sentry: {
    dsn: process.env.SENTRY_DSN || '',
  },

  firebase: {
    serviceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT || '',
  },

  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  backendUrl: process.env.BACKEND_URL || 'http://localhost:5000',
  mobileDeepLinkScheme: process.env.MOBILE_DEEP_LINK_SCHEME || 'kska',
};

export const isProd = config.nodeEnv === 'production';
export const isTest = config.nodeEnv === 'test';
