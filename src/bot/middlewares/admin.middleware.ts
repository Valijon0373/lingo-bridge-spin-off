import { MiddlewareFn } from 'telegraf';
import { BotContext } from '../../types';
import { env } from '../../config/env.config';
import { t } from '../../utils/i18n.util';

export const adminMiddleware: MiddlewareFn<BotContext> = async (ctx, next) => {
  const telegramId = ctx.from?.id;
  if (!telegramId || !env.ADMIN_IDS.includes(telegramId)) {
    if ('callback_query' in ctx.update) {
      await ctx.answerCbQuery('⛔ Siz admin emassiz!', { show_alert: true }).catch(() => {});
    } else {
      await ctx.reply('⛔ **Ushbu buyruq va bo‘lim faqat adminlar uchun mo‘ljallangan!**', { parse_mode: 'HTML' });
    }
    return;
  }
  return next();
};
