import { createBot } from './bot/bot';
import { prisma } from './database/prisma.service';
import { env } from './config/env.config';
import { logger } from './config/logger.config';

async function bootstrap() {
  logger.info('🚀 Starting Telegram Translation Service Bot...');

  // 1. Connect Database
  await prisma.connect();

  // 2. Instantiate Bot
  const bot = createBot();

  // Graceful Shutdown Handler
  const handleShutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Gracefully shutting down...`);
    try {
      bot.stop(signal);
      await prisma.disconnect();
      process.exit(0);
    } catch (err) {
      logger.error('Error during shutdown:', err);
      process.exit(1);
    }
  };

  process.once('SIGINT', () => handleShutdown('SIGINT'));
  process.once('SIGTERM', () => handleShutdown('SIGTERM'));

  // 3. Launch Telegram Bot Long Polling
  if (env.BOT_TOKEN && env.BOT_TOKEN !== '123456789:DEFAULT_DUMMY_TOKEN') {
    try {
      const botInfo = await bot.telegram.getMe();
      logger.info(`🤖 Telegram Bot (@${botInfo.username}) is starting in Long Polling mode...`);

      // Clear any existing webhook before starting long polling
      await bot.telegram.deleteWebhook({ drop_pending_updates: false }).catch(() => {});

      // Set bot command menu button
      await bot.telegram.setMyCommands([
        { command: 'start', description: 'Botni ishga tushirish' },
        { command: 'admin', description: 'Statistika olish faqat admin uchun!' },
        { command: 'restart', description: 'Qayta murojaat yuborish' },
      ]);
      logger.info('✅ Bot command menu (start, admin, restart) successfully set!');

      bot.launch().then(() => {
        logger.info('Telegram Bot stopped.');
      }).catch((err) => {
        logger.error('Failed to launch Telegram Bot:', err);
      });

      logger.info(`✅ Telegram Bot (@${botInfo.username}) is successfully running!`);
    } catch (err) {
      logger.error('Failed to get bot info or launch bot:', err);
    }
  } else {
    logger.warn(
      '⚠️ BOT_TOKEN is not set or using dummy token. Please configure BOT_TOKEN in .env file to start polling.'
    );
  }
}

bootstrap().catch((err) => {
  logger.error('Fatal bootstrap error:', err);
});
