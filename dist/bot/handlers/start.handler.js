"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerStartHandler = registerStartHandler;
const types_1 = require("../../types");
const user_service_1 = require("../../services/user/user.service");
const common_keyboard_1 = require("../keyboards/common.keyboard");
const env_config_1 = require("../../config/env.config");
const i18n_util_1 = require("../../utils/i18n.util");
function registerStartHandler(bot) {
    bot.command('start', async (ctx) => {
        const telegramId = ctx.from.id;
        const isAdmin = env_config_1.env.ADMIN_IDS.includes(telegramId);
        // Always start by asking language or transitioning to main menu if already registered
        const user = await user_service_1.userService.getOrCreateUser(telegramId, ctx.from.username);
        if (user.phone && user.firstName) {
            // User is fully registered, send main menu
            await user_service_1.userService.updateStep(telegramId, types_1.UserStep.MAIN_MENU);
            await ctx.reply((0, i18n_util_1.t)(ctx.language, 'main_menu_title'), common_keyboard_1.CommonKeyboard.getMainMenu(ctx.language, isAdmin));
            return;
        }
        // Prompt for language selection
        await user_service_1.userService.updateStep(telegramId, types_1.UserStep.SELECT_LANGUAGE);
        await ctx.reply((0, i18n_util_1.t)(ctx.language, 'select_language'), common_keyboard_1.CommonKeyboard.getLanguageKeyboard());
    });
    bot.command('restart', async (ctx) => {
        const telegramId = ctx.from.id;
        const isAdmin = env_config_1.env.ADMIN_IDS.includes(telegramId);
        const user = await user_service_1.userService.getOrCreateUser(telegramId, ctx.from.username);
        await user_service_1.userService.updateStep(telegramId, types_1.UserStep.MAIN_MENU, {});
        if (user.phone && user.firstName) {
            await ctx.reply((0, i18n_util_1.t)(ctx.language, 'main_menu_title'), common_keyboard_1.CommonKeyboard.getMainMenu(ctx.language, isAdmin));
        }
        else {
            await user_service_1.userService.updateStep(telegramId, types_1.UserStep.SELECT_LANGUAGE);
            await ctx.reply((0, i18n_util_1.t)(ctx.language, 'select_language'), common_keyboard_1.CommonKeyboard.getLanguageKeyboard());
        }
    });
    bot.action(/^lang_(uz|ru|en)$/, async (ctx) => {
        const lang = ctx.match[1];
        const telegramId = ctx.from.id;
        const isAdmin = env_config_1.env.ADMIN_IDS.includes(telegramId);
        ctx.language = lang;
        const dbLang = lang.toUpperCase();
        await user_service_1.userService.setLanguage(telegramId, dbLang);
        // If user is already registered, switch language and show main menu
        if (ctx.dbUser?.phone && ctx.dbUser?.firstName) {
            await user_service_1.userService.updateStep(telegramId, types_1.UserStep.MAIN_MENU);
            await ctx.answerCbQuery();
            await ctx.reply((0, i18n_util_1.t)(lang, 'main_menu_title'), common_keyboard_1.CommonKeyboard.getMainMenu(lang, isAdmin));
            return;
        }
        // Otherwise move to step 1 of registration: Surname
        await user_service_1.userService.updateStep(telegramId, types_1.UserStep.ENTER_LAST_NAME, { language: lang });
        await ctx.answerCbQuery();
        await ctx.reply((0, i18n_util_1.t)(lang, 'enter_last_name'));
    });
}
