import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  BOT_TOKEN: process.env.BOT_TOKEN || '',
  DATABASE_URL: process.env.DATABASE_URL || '',
  ADMIN_IDS: (process.env.ADMIN_IDS || '').split(',').map((id) => parseInt(id.trim(), 10)).filter(Boolean),
  PAYMENT_PROVIDER: process.env.PAYMENT_PROVIDER || 'MOCK',
  CLICK_SERVICE_ID: process.env.CLICK_SERVICE_ID || '',
  CLICK_MERCHANT_ID: process.env.CLICK_MERCHANT_ID || '',
  CLICK_SECRET_KEY: process.env.CLICK_SECRET_KEY || '',
  PAYME_MERCHANT_ID: process.env.PAYME_MERCHANT_ID || '',
  PAYME_SECRET_KEY: process.env.PAYME_SECRET_KEY || '',
  MAX_FILE_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB || '20', 10),
};
