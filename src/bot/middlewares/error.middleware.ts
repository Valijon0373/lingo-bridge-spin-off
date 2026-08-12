import { MiddlewareFn } from 'telegraf';
import { BotContext } from '../../types';
import { logger } from '../../config/logger.config';
import { t } from '../../utils/i18n.util';

export const errorMiddleware: MiddlewareFn<BotContext> = async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    logger.error('Unhandled error in bot update handler:', error);
    try {
      await ctx.reply('⚠️ ' + t(ctx.language, 'invalid_text_input') + ' An unexpected error occurred. Please try again.');
    } catch (sendErr) {
      logger.error('Could not send error response to user:', sendErr);
    }
  }
};
