"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminMiddleware = void 0;
const env_config_1 = require("../../config/env.config");
const adminMiddleware = async (ctx, next) => {
    const telegramId = ctx.from?.id;
    if (!telegramId || !env_config_1.env.ADMIN_IDS.includes(telegramId)) {
        if ('callback_query' in ctx.update) {
            await ctx.answerCbQuery('⛔ Siz admin emassiz!', { show_alert: true }).catch(() => { });
        }
        else {
            await ctx.reply('⛔ **Ushbu buyruq va bo‘lim faqat adminlar uchun mo‘ljallangan!**', { parse_mode: 'HTML' });
        }
        return;
    }
    return next();
};
exports.adminMiddleware = adminMiddleware;
