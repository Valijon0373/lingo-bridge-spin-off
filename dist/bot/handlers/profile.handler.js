"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerProfileHandler = registerProfileHandler;
const types_1 = require("../../types");
const user_service_1 = require("../../services/user/user.service");
const order_service_1 = require("../../services/order/order.service");
const service_repository_1 = require("../../database/repositories/service.repository");
const common_keyboard_1 = require("../keyboards/common.keyboard");
const env_config_1 = require("../../config/env.config");
const i18n_util_1 = require("../../utils/i18n.util");
function registerProfileHandler(bot) {
    // Main Menu "👤 Profilim" button
    bot.hears([(0, i18n_util_1.t)('uz', 'btn_profile'), (0, i18n_util_1.t)('ru', 'btn_profile'), (0, i18n_util_1.t)('en', 'btn_profile')], async (ctx) => {
        if (!ctx.dbUser)
            return;
        const lang = ctx.language;
        const isAdmin = env_config_1.env.ADMIN_IDS.includes(ctx.from?.id || 0);
        const stats = await user_service_1.userService.getUserProfileDetails(ctx.dbUser.id);
        let langName = '🇺🇿 O‘zbek';
        if (lang === 'ru')
            langName = '🇷🇺 Русский';
        if (lang === 'en')
            langName = '🇬🇧 English';
        const text = (0, i18n_util_1.t)(lang, 'profile_info', {
            lastName: ctx.dbUser.lastName || '',
            firstName: ctx.dbUser.firstName || '',
            phone: ctx.dbUser.phone || '',
            language: langName,
            orderCount: stats.orderCount,
            totalSpent: stats.totalSpent.toLocaleString(),
        });
        await ctx.reply(text, {
            parse_mode: 'HTML',
            ...common_keyboard_1.CommonKeyboard.getMainMenu(lang, isAdmin),
        });
    });
    // Main Menu "📦 Mening buyurtmalarim" button
    bot.hears([(0, i18n_util_1.t)('uz', 'btn_my_orders'), (0, i18n_util_1.t)('ru', 'btn_my_orders'), (0, i18n_util_1.t)('en', 'btn_my_orders')], async (ctx) => {
        if (!ctx.dbUser)
            return;
        const lang = ctx.language;
        const isAdmin = env_config_1.env.ADMIN_IDS.includes(ctx.from?.id || 0);
        const orders = await order_service_1.orderService.getUserOrders(ctx.dbUser.id);
        if (orders.length === 0) {
            await ctx.reply((0, i18n_util_1.t)(lang, 'no_orders'), common_keyboard_1.CommonKeyboard.getMainMenu(lang, isAdmin));
            return;
        }
        await ctx.reply((0, i18n_util_1.t)(lang, 'my_orders_title'), { parse_mode: 'HTML' });
        for (const order of orders) {
            const service = await service_repository_1.serviceRepository.findById(order.serviceId);
            let serviceName = service?.nameUz || 'Service';
            if (lang === 'ru')
                serviceName = service?.nameRu || serviceName;
            if (lang === 'en')
                serviceName = service?.nameEn || serviceName;
            const statusStr = (0, i18n_util_1.t)(lang, `status_${order.status}`);
            const directionStr = `${order.sourceLanguage} → ${order.targetLanguage}`;
            const orderText = (0, i18n_util_1.t)(lang, 'order_item', {
                orderNumber: order.orderNumber,
                serviceName,
                direction: directionStr,
                totalPrice: Number(order.totalPrice).toLocaleString(),
                status: statusStr,
            });
            await ctx.reply(orderText);
        }
    });
    // Main Menu "💬 Yordam" button
    bot.hears([(0, i18n_util_1.t)('uz', 'btn_help'), (0, i18n_util_1.t)('ru', 'btn_help'), (0, i18n_util_1.t)('en', 'btn_help')], async (ctx) => {
        const lang = ctx.language;
        const isAdmin = env_config_1.env.ADMIN_IDS.includes(ctx.from?.id || 0);
        await ctx.reply((0, i18n_util_1.t)(lang, 'help_text'), {
            parse_mode: 'HTML',
            ...common_keyboard_1.CommonKeyboard.getMainMenu(lang, isAdmin),
        });
    });
    // Main Menu "🌐 Tilni o'zgartirish" button
    bot.hears([(0, i18n_util_1.t)('uz', 'btn_change_lang'), (0, i18n_util_1.t)('ru', 'btn_change_lang'), (0, i18n_util_1.t)('en', 'btn_change_lang')], async (ctx) => {
        const telegramId = ctx.from.id;
        const lang = ctx.language;
        await user_service_1.userService.updateStep(telegramId, types_1.UserStep.SELECT_LANGUAGE);
        await ctx.reply((0, i18n_util_1.t)(lang, 'select_language'), common_keyboard_1.CommonKeyboard.getLanguageKeyboard());
    });
}
