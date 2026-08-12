"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRegistrationHandler = registerRegistrationHandler;
const types_1 = require("../../types");
const user_service_1 = require("../../services/user/user.service");
const registration_keyboard_1 = require("../keyboards/registration.keyboard");
const common_keyboard_1 = require("../keyboards/common.keyboard");
const validator_util_1 = require("../../utils/validator.util");
const env_config_1 = require("../../config/env.config");
const i18n_util_1 = require("../../utils/i18n.util");
function registerRegistrationHandler(bot) {
    // Handle text responses during registration steps
    bot.on('text', async (ctx, next) => {
        const step = ctx.dbUser?.step;
        const text = ctx.message.text.trim();
        const telegramId = ctx.from.id;
        const lang = ctx.language;
        const isAdmin = env_config_1.env.ADMIN_IDS.includes(telegramId);
        // Handle cancel button click
        if (text === (0, i18n_util_1.t)(lang, 'btn_cancel')) {
            await user_service_1.userService.updateStep(telegramId, types_1.UserStep.MAIN_MENU);
            await ctx.reply((0, i18n_util_1.t)(lang, 'main_menu_title'), common_keyboard_1.CommonKeyboard.getMainMenu(lang, isAdmin));
            return;
        }
        const sessionData = (ctx.dbUser?.stepData || {});
        if (step === types_1.UserStep.ENTER_LAST_NAME) {
            if (!validator_util_1.ValidatorUtil.isValidName(text)) {
                await ctx.reply((0, i18n_util_1.t)(lang, 'invalid_text_input'));
                return;
            }
            sessionData.tempLastName = text;
            await user_service_1.userService.updateStep(telegramId, types_1.UserStep.ENTER_FIRST_NAME, sessionData);
            await ctx.reply((0, i18n_util_1.t)(lang, 'enter_first_name'));
            return;
        }
        if (step === types_1.UserStep.ENTER_FIRST_NAME) {
            if (!validator_util_1.ValidatorUtil.isValidName(text)) {
                await ctx.reply((0, i18n_util_1.t)(lang, 'invalid_text_input'));
                return;
            }
            sessionData.tempFirstName = text;
            await user_service_1.userService.updateStep(telegramId, types_1.UserStep.ENTER_PHONE, sessionData);
            await ctx.reply((0, i18n_util_1.t)(lang, 'enter_phone'), registration_keyboard_1.RegistrationKeyboard.getPhoneKeyboard(lang));
            return;
        }
        if (step === types_1.UserStep.ENTER_PHONE) {
            if (!validator_util_1.ValidatorUtil.isValidPhoneNumber(text)) {
                await ctx.reply((0, i18n_util_1.t)(lang, 'invalid_phone_input'));
                return;
            }
            const formattedPhone = validator_util_1.ValidatorUtil.formatPhoneNumber(text);
            sessionData.tempPhone = formattedPhone;
            await showProfileConfirmation(ctx, sessionData);
            return;
        }
        return next();
    });
    // Handle Telegram contact share button
    bot.on('contact', async (ctx) => {
        const step = ctx.dbUser?.step;
        if (step !== types_1.UserStep.ENTER_PHONE)
            return;
        const contact = ctx.message.contact;
        const telegramId = ctx.from.id;
        const sessionData = (ctx.dbUser?.stepData || {});
        const formattedPhone = validator_util_1.ValidatorUtil.formatPhoneNumber(contact.phone_number);
        sessionData.tempPhone = formattedPhone;
        await showProfileConfirmation(ctx, sessionData);
    });
    // Action callbacks for profile confirmation
    bot.action('confirm_reg', async (ctx) => {
        const telegramId = ctx.from.id;
        const sessionData = (ctx.dbUser?.stepData || {});
        const lang = ctx.language;
        if (sessionData.tempFirstName && sessionData.tempLastName && sessionData.tempPhone) {
            await user_service_1.userService.updateProfile(telegramId, sessionData.tempFirstName, sessionData.tempLastName, sessionData.tempPhone);
            const isAdmin = env_config_1.env.ADMIN_IDS.includes(telegramId);
            await user_service_1.userService.updateStep(telegramId, types_1.UserStep.MAIN_MENU, {});
            await ctx.answerCbQuery();
            await ctx.reply((0, i18n_util_1.t)(lang, 'registration_complete'));
            await ctx.reply((0, i18n_util_1.t)(lang, 'main_menu_title'), common_keyboard_1.CommonKeyboard.getMainMenu(lang, isAdmin));
        }
    });
    bot.action('edit_reg', async (ctx) => {
        const telegramId = ctx.from.id;
        const lang = ctx.language;
        await user_service_1.userService.updateStep(telegramId, types_1.UserStep.ENTER_LAST_NAME, {});
        await ctx.answerCbQuery();
        await ctx.reply((0, i18n_util_1.t)(lang, 'enter_last_name'));
    });
}
async function showProfileConfirmation(ctx, sessionData) {
    const telegramId = ctx.from.id;
    const lang = ctx.language;
    await user_service_1.userService.updateStep(telegramId, types_1.UserStep.CONFIRM_PROFILE, sessionData);
    const confirmText = (0, i18n_util_1.t)(lang, 'confirm_profile_title', {
        lastName: sessionData.tempLastName || '',
        firstName: sessionData.tempFirstName || '',
        phone: sessionData.tempPhone || '',
    });
    await ctx.reply(confirmText, {
        parse_mode: 'HTML',
        ...registration_keyboard_1.RegistrationKeyboard.getConfirmationKeyboard(lang),
    });
}
