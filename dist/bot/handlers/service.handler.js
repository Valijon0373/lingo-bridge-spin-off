"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerServiceHandler = registerServiceHandler;
exports.showServicesCatalog = showServicesCatalog;
const types_1 = require("../../types");
const service_repository_1 = require("../../database/repositories/service.repository");
const user_service_1 = require("../../services/user/user.service");
const service_keyboard_1 = require("../keyboards/service.keyboard");
const common_keyboard_1 = require("../keyboards/common.keyboard");
const env_config_1 = require("../../config/env.config");
const i18n_util_1 = require("../../utils/i18n.util");
function registerServiceHandler(bot) {
    // Main menu "📄 Tarjima xizmatlari" button click
    bot.hears([(0, i18n_util_1.t)('uz', 'btn_services'), (0, i18n_util_1.t)('ru', 'btn_services'), (0, i18n_util_1.t)('en', 'btn_services')], async (ctx) => {
        await showServicesCatalog(ctx);
    });
    // Service selection inline button click (e.g. srv_1234)
    bot.action(/^srv_(.+)$/, async (ctx) => {
        const serviceId = ctx.match[1];
        const telegramId = ctx.from.id;
        const lang = ctx.language;
        const service = await service_repository_1.serviceRepository.findById(serviceId);
        if (!service) {
            await ctx.answerCbQuery('Service not found');
            return;
        }
        const sessionData = {
            ...ctx.dbUser?.stepData,
            selectedServiceId: service.id,
        };
        await user_service_1.userService.updateStep(telegramId, types_1.UserStep.SELECT_TRANSLATION_DIRECTION, sessionData);
        let name = service.nameUz;
        let desc = service.descriptionUz;
        if (lang === 'ru') {
            name = service.nameRu;
            desc = service.descriptionRu;
        }
        if (lang === 'en') {
            name = service.nameEn;
            desc = service.descriptionEn;
        }
        const priceTypeStr = (0, i18n_util_1.t)(lang, `price_type_${service.priceType}`);
        const text = (0, i18n_util_1.t)(lang, 'service_detail', {
            name,
            description: desc,
            price: service.price.toLocaleString(),
            priceType: priceTypeStr,
        });
        await ctx.answerCbQuery();
        await ctx.reply(text, {
            parse_mode: 'HTML',
            ...service_keyboard_1.ServiceKeyboard.getTranslationDirectionsKeyboard(lang),
        });
    });
    // Translation direction selection (e.g. dir_uz_ru)
    bot.action(/^dir_([a-z]+)_([a-z]+)$/, async (ctx) => {
        const srcLang = ctx.match[1];
        const tgtLang = ctx.match[2];
        const telegramId = ctx.from.id;
        const lang = ctx.language;
        const sessionData = {
            ...ctx.dbUser?.stepData,
            sourceLanguage: srcLang.toUpperCase(),
            targetLanguage: tgtLang.toUpperCase(),
        };
        await user_service_1.userService.updateStep(telegramId, types_1.UserStep.UPLOAD_DOCUMENT, sessionData);
        await ctx.answerCbQuery();
        await ctx.reply((0, i18n_util_1.t)(lang, 'upload_document_prompt'), {
            parse_mode: 'HTML',
            ...common_keyboard_1.CommonKeyboard.getCancelOrBack(lang),
        });
    });
    // Navigation handlers
    bot.action('nav_services_list', async (ctx) => {
        await ctx.answerCbQuery();
        await showServicesCatalog(ctx);
    });
    bot.action('nav_main_menu', async (ctx) => {
        const telegramId = ctx.from.id;
        const lang = ctx.language;
        const isAdmin = env_config_1.env.ADMIN_IDS.includes(telegramId);
        await user_service_1.userService.updateStep(telegramId, types_1.UserStep.MAIN_MENU);
        await ctx.answerCbQuery();
        await ctx.reply((0, i18n_util_1.t)(lang, 'main_menu_title'), common_keyboard_1.CommonKeyboard.getMainMenu(lang, isAdmin));
    });
}
async function showServicesCatalog(ctx) {
    const telegramId = ctx.from.id;
    const lang = ctx.language;
    const services = await service_repository_1.serviceRepository.findAllActive();
    await user_service_1.userService.updateStep(telegramId, types_1.UserStep.SELECT_SERVICE);
    await ctx.reply((0, i18n_util_1.t)(lang, 'select_service'), {
        parse_mode: 'HTML',
        ...service_keyboard_1.ServiceKeyboard.getServicesListKeyboard(services, lang),
    });
}
