"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerOrderHandler = registerOrderHandler;
exports.createAndShowOrderSummary = createAndShowOrderSummary;
const types_1 = require("../../types");
const user_service_1 = require("../../services/user/user.service");
const order_service_1 = require("../../services/order/order.service");
const service_repository_1 = require("../../database/repositories/service.repository");
const pdf_service_1 = require("../../services/pdf/pdf.service");
const order_keyboard_1 = require("../keyboards/order.keyboard");
const service_keyboard_1 = require("../keyboards/service.keyboard");
const common_keyboard_1 = require("../keyboards/common.keyboard");
const validator_util_1 = require("../../utils/validator.util");
const env_config_1 = require("../../config/env.config");
const i18n_util_1 = require("../../utils/i18n.util");
const client_1 = require("@prisma/client");
function registerOrderHandler(bot) {
    // Handle document upload
    bot.on(['document', 'photo'], async (ctx, next) => {
        const step = ctx.dbUser?.step;
        if (step !== types_1.UserStep.UPLOAD_DOCUMENT)
            return next();
        const telegramId = ctx.from.id;
        const lang = ctx.language;
        const sessionData = (ctx.dbUser?.stepData || {});
        let fileId = '';
        let fileName = 'document';
        let mimeType = '';
        if (ctx.message && 'document' in ctx.message) {
            fileId = ctx.message.document.file_id;
            fileName = ctx.message.document.file_name || 'document.pdf';
            mimeType = ctx.message.document.mime_type || '';
        }
        else if (ctx.message && 'photo' in ctx.message) {
            // Pick highest resolution photo
            const photoArray = ctx.message.photo;
            fileId = photoArray[photoArray.length - 1].file_id;
            fileName = 'photo.jpg';
            mimeType = 'image/jpeg';
        }
        if (!validator_util_1.ValidatorUtil.isSupportedFile(fileName, mimeType)) {
            await ctx.reply((0, i18n_util_1.t)(lang, 'invalid_file_format'));
            return;
        }
        sessionData.fileId = fileId;
        sessionData.fileName = fileName;
        // Check service price type
        const service = await service_repository_1.serviceRepository.findById(sessionData.selectedServiceId || '');
        if (!service) {
            await ctx.reply((0, i18n_util_1.t)(lang, 'invalid_text_input'));
            return;
        }
        // Attempt automatic PDF page count if it is a PDF file
        let autoPages = null;
        if (fileName.toLowerCase().endsWith('.pdf') || mimeType === 'application/pdf') {
            try {
                const fileLink = await ctx.telegram.getFileLink(fileId);
                autoPages = await pdf_service_1.PdfService.getPdfPageCountFromUrl(fileLink.toString());
            }
            catch (err) {
                autoPages = null;
            }
        }
        if (service.priceType === client_1.PriceType.FIXED) {
            sessionData.pageCount = 1;
            await createAndShowOrderSummary(ctx, sessionData);
        }
        else if (autoPages && autoPages > 0) {
            sessionData.pageCount = autoPages;
            await ctx.reply((0, i18n_util_1.t)(lang, 'pdf_auto_detected', { pages: autoPages }));
            await createAndShowOrderSummary(ctx, sessionData);
        }
        else {
            await user_service_1.userService.updateStep(telegramId, types_1.UserStep.ENTER_PAGE_COUNT, sessionData);
            await ctx.reply((0, i18n_util_1.t)(lang, 'enter_page_count'), common_keyboard_1.CommonKeyboard.getCancelOrBack(lang));
        }
    });
    // Handle manual page count entry
    bot.on('text', async (ctx, next) => {
        const step = ctx.dbUser?.step;
        if (step !== types_1.UserStep.ENTER_PAGE_COUNT)
            return next();
        const text = ctx.message.text.trim();
        const telegramId = ctx.from.id;
        const lang = ctx.language;
        const sessionData = (ctx.dbUser?.stepData || {});
        const pages = parseInt(text, 10);
        if (isNaN(pages) || pages <= 0) {
            await ctx.reply((0, i18n_util_1.t)(lang, 'invalid_page_count'));
            return;
        }
        sessionData.pageCount = pages;
        await createAndShowOrderSummary(ctx, sessionData);
    });
    // Action callback: cancel order
    bot.action('order_cancel', async (ctx) => {
        const telegramId = ctx.from.id;
        const lang = ctx.language;
        const isAdmin = env_config_1.env.ADMIN_IDS.includes(telegramId);
        await user_service_1.userService.updateStep(telegramId, types_1.UserStep.MAIN_MENU, {});
        await ctx.answerCbQuery();
        await ctx.reply((0, i18n_util_1.t)(lang, 'main_menu_title'), common_keyboard_1.CommonKeyboard.getMainMenu(lang, isAdmin));
    });
    // Action callback: edit order (restart service selection)
    bot.action('order_edit', async (ctx) => {
        const telegramId = ctx.from.id;
        const lang = ctx.language;
        await user_service_1.userService.updateStep(telegramId, types_1.UserStep.SELECT_SERVICE, {});
        await ctx.answerCbQuery();
        const services = await service_repository_1.serviceRepository.findAllActive();
        await ctx.reply((0, i18n_util_1.t)(lang, 'select_service'), service_keyboard_1.ServiceKeyboard.getServicesListKeyboard(services, lang));
    });
}
async function createAndShowOrderSummary(ctx, sessionData) {
    const telegramId = ctx.from.id;
    const lang = ctx.language;
    if (!ctx.dbUser?.id || !sessionData.selectedServiceId)
        return;
    const order = await order_service_1.orderService.createOrder({
        userId: ctx.dbUser.id,
        serviceId: sessionData.selectedServiceId,
        sourceLanguage: sessionData.sourceLanguage || 'UZ',
        targetLanguage: sessionData.targetLanguage || 'RU',
        fileId: sessionData.fileId || '',
        fileName: sessionData.fileName || 'document',
        pageCount: sessionData.pageCount || 1,
    });
    sessionData.currentOrderId = order.id;
    await user_service_1.userService.updateStep(telegramId, types_1.UserStep.CONFIRM_ORDER, sessionData);
    const service = await service_repository_1.serviceRepository.findById(order.serviceId);
    let serviceName = service?.nameUz || 'Service';
    if (lang === 'ru')
        serviceName = service?.nameRu || serviceName;
    if (lang === 'en')
        serviceName = service?.nameEn || serviceName;
    const priceTypeStr = (0, i18n_util_1.t)(lang, `price_type_${service?.priceType || 'PER_PAGE'}`);
    const directionStr = `🇺🇿 ${order.sourceLanguage} → 🇷🇺 ${order.targetLanguage}`;
    const summaryText = (0, i18n_util_1.t)(lang, 'order_summary', {
        serviceName,
        direction: directionStr,
        pages: order.pageCount,
        unitPrice: Number(order.unitPrice).toLocaleString(),
        priceType: priceTypeStr,
        totalPrice: Number(order.totalPrice).toLocaleString(),
    });
    await ctx.reply(summaryText, {
        parse_mode: 'HTML',
        ...order_keyboard_1.OrderKeyboard.getSummaryKeyboard(lang),
    });
}
