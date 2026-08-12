"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bot_1 = require("./bot/bot");
const prisma_service_1 = require("./database/prisma.service");
const env_config_1 = require("./config/env.config");
const logger_config_1 = require("./config/logger.config");
async function bootstrap() {
    logger_config_1.logger.info('🚀 Starting Telegram Translation Service Bot...');
    // 1. Connect Database
    await prisma_service_1.prisma.connect();
    // 2. Instantiate Bot
    const bot = (0, bot_1.createBot)();
    // Graceful Shutdown Handler
    const handleShutdown = async (signal) => {
        logger_config_1.logger.info(`Received ${signal}. Gracefully shutting down...`);
        try {
            bot.stop(signal);
            await prisma_service_1.prisma.disconnect();
            process.exit(0);
        }
        catch (err) {
            logger_config_1.logger.error('Error during shutdown:', err);
            process.exit(1);
        }
    };
    process.once('SIGINT', () => handleShutdown('SIGINT'));
    process.once('SIGTERM', () => handleShutdown('SIGTERM'));
    // 3. Launch Telegram Bot Long Polling
    if (env_config_1.env.BOT_TOKEN && env_config_1.env.BOT_TOKEN !== '123456789:DEFAULT_DUMMY_TOKEN') {
        try {
            const botInfo = await bot.telegram.getMe();
            logger_config_1.logger.info(`🤖 Telegram Bot (@${botInfo.username}) is starting in Long Polling mode...`);
            // Clear any existing webhook before starting long polling
            await bot.telegram.deleteWebhook({ drop_pending_updates: false }).catch(() => { });
            // Set bot command menu button
            await bot.telegram.setMyCommands([
                { command: 'start', description: 'Botni ishga tushirish' },
                { command: 'admin', description: 'Statistika olish faqat admin uchun!' },
                { command: 'restart', description: 'Qayta murojaat yuborish' },
            ]);
            logger_config_1.logger.info('✅ Bot command menu (start, admin, restart) successfully set!');
            bot.launch().then(() => {
                logger_config_1.logger.info('Telegram Bot stopped.');
            }).catch((err) => {
                logger_config_1.logger.error('Failed to launch Telegram Bot:', err);
            });
            logger_config_1.logger.info(`✅ Telegram Bot (@${botInfo.username}) is successfully running!`);
        }
        catch (err) {
            logger_config_1.logger.error('Failed to get bot info or launch bot:', err);
        }
    }
    else {
        logger_config_1.logger.warn('⚠️ BOT_TOKEN is not set or using dummy token. Please configure BOT_TOKEN in .env file to start polling.');
    }
}
bootstrap().catch((err) => {
    logger_config_1.logger.error('Fatal bootstrap error:', err);
});
