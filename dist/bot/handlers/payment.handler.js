"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerPaymentHandler = registerPaymentHandler;
const types_1 = require("../../types");
const user_service_1 = require("../../services/user/user.service");
const order_service_1 = require("../../services/order/order.service");
const admin_keyboard_1 = require("../keyboards/admin.keyboard");
const common_keyboard_1 = require("../keyboards/common.keyboard");
const service_repository_1 = require("../../database/repositories/service.repository");
const env_config_1 = require("../../config/env.config");
const i18n_util_1 = require("../../utils/i18n.util");
const client_1 = require("@prisma/client");
const logger_config_1 = require("../../config/logger.config");
function registerPaymentHandler(bot) {
    // Action callback: "💳 To'lov qilish"
    bot.action('order_pay', async (ctx) => {
        const telegramId = ctx.from.id;
        const lang = ctx.language;
        const sessionData = (ctx.dbUser?.stepData || {});
        if (!sessionData.currentOrderId) {
            await ctx.answerCbQuery('Order not found');
            return;
        }
        const order = await order_service_1.orderService.getOrderDetails(sessionData.currentOrderId);
        if (!order) {
            await ctx.answerCbQuery('Order not found');
            return;
        }
        await user_service_1.userService.updateStep(telegramId, types_1.UserStep.UPLOAD_RECEIPT, sessionData);
        await ctx.answerCbQuery();
        const paymentText = `💳 <b>To‘lovni amalga oshirish va chekni yuborish</b>\n\n` +
            `Buyurtma kodi: <b>#${order.orderNumber}</b>\n` +
            `Jami to‘lov summasi: <b>${Number(order.totalPrice).toLocaleString()} so‘m</b>\n\n` +
            `📌 Iltimos, to‘lovni amalga oshirib, <b>to‘lov chekini (rasm yoki fayl ko‘rinishida)</b> ushbu chatga yuboring:`;
        await ctx.reply(paymentText, {
            parse_mode: 'HTML',
            ...common_keyboard_1.CommonKeyboard.getCancelOrBack(lang, false),
        });
    });
    // Document/Photo handler for Payment Receipt (Chek) upload
    bot.on(['document', 'photo'], async (ctx, next) => {
        const step = ctx.dbUser?.step;
        if (step !== types_1.UserStep.UPLOAD_RECEIPT)
            return next();
        const telegramId = ctx.from.id;
        const lang = ctx.language;
        const sessionData = (ctx.dbUser?.stepData || {});
        const orderId = sessionData.currentOrderId;
        if (!orderId) {
            await ctx.reply('❌ Buyurtma topilmadi.');
            return;
        }
        const order = await order_service_1.orderService.getOrderDetails(orderId);
        if (!order) {
            await ctx.reply('❌ Buyurtma topilmadi.');
            return;
        }
        let receiptFileId = '';
        let isPhoto = false;
        if (ctx.message && 'document' in ctx.message) {
            receiptFileId = ctx.message.document.file_id;
        }
        else if (ctx.message && 'photo' in ctx.message) {
            const photos = ctx.message.photo;
            receiptFileId = photos[photos.length - 1].file_id;
            isPhoto = true;
        }
        // 1. Update order status in DB
        await order_service_1.orderService.updateStatus(order.id, client_1.OrderStatus.IN_PROGRESS);
        await user_service_1.userService.updateStep(telegramId, types_1.UserStep.MAIN_MENU, {});
        // 2. Reply to User
        const successText = `✅ <b>To‘lov chekingiz va buyurtmangiz qabul qilindi!</b>\n\n` +
            `<b>Buyurtma kodi:</b> #${order.orderNumber}\n` +
            `<b>Jami summa:</b> ${Number(order.totalPrice).toLocaleString()} so‘m\n\n` +
            `⏳ Tez orada adminlarimiz to‘lovni tekshirib, faylni tarjima qilib ushbu bot orqali yuborishadi.`;
        const isAdminUser = env_config_1.env.ADMIN_IDS.includes(telegramId);
        await ctx.reply(successText, {
            parse_mode: 'HTML',
            ...common_keyboard_1.CommonKeyboard.getMainMenu(lang, isAdminUser),
        });
        // 3. Forward Chek and Source File to all Admins
        const service = await service_repository_1.serviceRepository.findById(order.serviceId);
        const serviceName = service?.nameUz || 'Tarjima xizmati';
        const user = order.user;
        const userFullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Mijoz';
        const usernameStr = user?.telegramUsername ? `@${user.telegramUsername}` : 'username yo‘q';
        const adminNoticeText = `📥 <b>YANGI BUYURTMA VA TO‘LOV CHEKI KELDI!</b>\n\n` +
            `🆔 <b>Buyurtma kodi:</b> #${order.orderNumber}\n` +
            `👤 <b>Mijoz:</b> ${userFullName} (${usernameStr})\n` +
            `📞 <b>Tel:</b> ${user?.phone || 'Biriktirilmagan'}\n` +
            `📄 <b>Xizmat:</b> ${serviceName}\n` +
            `🌐 <b>Yo‘nalish:</b> ${order.sourceLanguage} → ${order.targetLanguage}\n` +
            `📑 <b>Sahifalar soni:</b> ${order.pageCount} ta\n` +
            `💰 <b>Jami summa:</b> ${Number(order.totalPrice).toLocaleString()} so‘m\n\n` +
            `👇 <b>Quyida to‘lov cheki hamda tarjima qilinadigan fayl yuborildi:</b>`;
        for (const adminId of env_config_1.env.ADMIN_IDS) {
            try {
                // Send main notice info message
                await ctx.telegram.sendMessage(adminId, adminNoticeText, { parse_mode: 'HTML' });
                // Send Chek (Receipt)
                if (isPhoto) {
                    await ctx.telegram.sendPhoto(adminId, receiptFileId, {
                        caption: `🧾 <b>To‘lov cheki</b> (Buyurtma #${order.orderNumber})`,
                        parse_mode: 'HTML',
                    });
                }
                else {
                    await ctx.telegram.sendDocument(adminId, receiptFileId, {
                        caption: `🧾 <b>To‘lov cheki</b> (Buyurtma #${order.orderNumber})`,
                        parse_mode: 'HTML',
                    });
                }
                // Send Source Document to translate with Admin Action buttons
                const docCaption = `📄 <b>Tarjima qilinadigan fayl</b> (Buyurtma #${order.orderNumber})`;
                if (order.fileId) {
                    try {
                        await ctx.telegram.sendDocument(adminId, order.fileId, {
                            caption: docCaption,
                            parse_mode: 'HTML',
                            ...admin_keyboard_1.AdminKeyboard.getOrderActionKeyboard(order.id, client_1.OrderStatus.IN_PROGRESS),
                        });
                    }
                    catch (e) {
                        await ctx.telegram.sendPhoto(adminId, order.fileId, {
                            caption: docCaption,
                            parse_mode: 'HTML',
                            ...admin_keyboard_1.AdminKeyboard.getOrderActionKeyboard(order.id, client_1.OrderStatus.IN_PROGRESS),
                        });
                    }
                }
            }
            catch (err) {
                logger_config_1.logger.error(`Failed to notify admin ${adminId}:`, err);
            }
        }
    });
    // Action callback: "✅ Confirm Payment" (legacy/manual check)
    bot.action('check_payment', async (ctx) => {
        const telegramId = ctx.from.id;
        const lang = ctx.language;
        const sessionData = (ctx.dbUser?.stepData || {});
        if (!sessionData.currentOrderId) {
            await ctx.answerCbQuery('Order not found');
            return;
        }
        const order = await order_service_1.orderService.getOrderDetails(sessionData.currentOrderId);
        if (!order) {
            await ctx.answerCbQuery('Order not found');
            return;
        }
        await user_service_1.userService.updateStep(telegramId, types_1.UserStep.IN_PROGRESS, {});
        await ctx.answerCbQuery('Payment Confirmed!');
        const service = await service_repository_1.serviceRepository.findById(order.serviceId);
        let serviceName = service?.nameUz || '';
        if (lang === 'ru')
            serviceName = service?.nameRu || serviceName;
        if (lang === 'en')
            serviceName = service?.nameEn || serviceName;
        const successText = (0, i18n_util_1.t)(lang, 'payment_success', {
            orderNumber: order.orderNumber,
            serviceName,
            totalPrice: Number(order.totalPrice).toLocaleString(),
        });
        const isAdmin = env_config_1.env.ADMIN_IDS.includes(telegramId);
        await ctx.reply(successText, {
            parse_mode: 'HTML',
            ...common_keyboard_1.CommonKeyboard.getMainMenu(lang, isAdmin),
        });
    });
}
