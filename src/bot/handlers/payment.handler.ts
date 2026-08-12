import { Telegraf } from 'telegraf';
import { BotContext, UserStep, SessionData } from '../../types';
import { userService } from '../../services/user/user.service';
import { orderService } from '../../services/order/order.service';
import { OrderKeyboard } from '../keyboards/order.keyboard';
import { AdminKeyboard } from '../keyboards/admin.keyboard';
import { CommonKeyboard } from '../keyboards/common.keyboard';
import { serviceRepository } from '../../database/repositories/service.repository';
import { env } from '../../config/env.config';
import { t } from '../../utils/i18n.util';
import { OrderStatus } from '@prisma/client';
import { logger } from '../../config/logger.config';

export function registerPaymentHandler(bot: Telegraf<BotContext>) {
  // Action callback: "💳 To'lov qilish"
  bot.action('order_pay', async (ctx) => {
    const telegramId = ctx.from.id;
    const lang = ctx.language;
    const sessionData = (ctx.dbUser?.stepData || {}) as SessionData;

    if (!sessionData.currentOrderId) {
      await ctx.answerCbQuery('Order not found');
      return;
    }

    const order = await orderService.getOrderDetails(sessionData.currentOrderId);
    if (!order) {
      await ctx.answerCbQuery('Order not found');
      return;
    }

    await userService.updateStep(telegramId, UserStep.UPLOAD_RECEIPT, sessionData);
    await ctx.answerCbQuery();

    const paymentText =
      `💳 <b>To‘lovni amalga oshirish va chekni yuborish</b>\n\n` +
      `Buyurtma kodi: <b>#${order.orderNumber}</b>\n` +
      `Jami to‘lov summasi: <b>${Number(order.totalPrice).toLocaleString()} so‘m</b>\n\n\n` +
      `  💳  <code>9860 0101 3366 7609</code> (Ipoteka Bank)\n` +
      `        Matkarimova Shohista\n \n\n` +
      `📌 Iltimos, to‘lovni amalga oshirib, <b>to‘lov chekini (rasm yoki fayl ko‘rinishida)</b> ushbu chatga yuboring:`;

    await ctx.reply(paymentText, {
      parse_mode: 'HTML',
      ...CommonKeyboard.getCancelOrBack(lang, false),
    });
  });

  // Document/Photo handler for Payment Receipt (Chek) upload
  bot.on(['document', 'photo'], async (ctx, next) => {
    const step = ctx.dbUser?.step;
    if (step !== UserStep.UPLOAD_RECEIPT) return next();

    const telegramId = ctx.from.id;
    const lang = ctx.language;
    const sessionData = (ctx.dbUser?.stepData || {}) as SessionData;
    const orderId = sessionData.currentOrderId;

    if (!orderId) {
      await ctx.reply('❌ Buyurtma topilmadi.');
      return;
    }

    const order = await orderService.getOrderDetails(orderId);
    if (!order) {
      await ctx.reply('❌ Buyurtma topilmadi.');
      return;
    }

    let receiptFileId = '';
    let isPhoto = false;

    if (ctx.message && 'document' in ctx.message) {
      receiptFileId = ctx.message.document.file_id;
    } else if (ctx.message && 'photo' in ctx.message) {
      const photos = ctx.message.photo;
      receiptFileId = photos[photos.length - 1].file_id;
      isPhoto = true;
    }

    // 1. Update order status in DB
    await orderService.updateStatus(order.id, OrderStatus.IN_PROGRESS);
    await userService.updateStep(telegramId, UserStep.MAIN_MENU, {});

    // 2. Reply to User
    const successText =
      `✅ <b>To‘lov chekingiz va buyurtmangiz qabul qilindi!</b>\n\n` +
      `<b>Buyurtma kodi:</b> #${order.orderNumber}\n` +
      `<b>Jami summa:</b> ${Number(order.totalPrice).toLocaleString()} so‘m\n\n` +
      `⏳ Tez orada adminlarimiz to‘lovni tekshirib, faylni tarjima qilib ushbu bot orqali yuborishadi.`;

    const isAdminUser = env.ADMIN_IDS.includes(telegramId);
    await ctx.reply(successText, {
      parse_mode: 'HTML',
      ...CommonKeyboard.getMainMenu(lang, isAdminUser),
    });

    // 3. Forward Chek and Source File to all Admins
    const service = await serviceRepository.findById(order.serviceId);
    const serviceName = service?.nameUz || 'Tarjima xizmati';
    const user = order.user;
    const userFullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Mijoz';
    const usernameStr = user?.telegramUsername ? `@${user.telegramUsername}` : 'username yo‘q';

    const adminNoticeText =
      `📥 <b>YANGI BUYURTMA VA TO‘LOV CHEKI KELDI!</b>\n\n` +
      `🆔 <b>Buyurtma kodi:</b> #${order.orderNumber}\n` +
      `👤 <b>Mijoz:</b> ${userFullName} (${usernameStr})\n` +
      `📞 <b>Tel:</b> ${user?.phone || 'Biriktirilmagan'}\n` +
      `📄 <b>Xizmat:</b> ${serviceName}\n` +
      `🌐 <b>Yo‘nalish:</b> ${order.sourceLanguage} → ${order.targetLanguage}\n` +
      `📑 <b>Sahifalar soni:</b> ${order.pageCount} ta\n` +
      `💰 <b>Jami summa:</b> ${Number(order.totalPrice).toLocaleString()} so‘m\n\n` +
      `👇 <b>Quyida to‘lov cheki hamda tarjima qilinadigan fayl yuborildi:</b>`;

    for (const adminId of env.ADMIN_IDS) {
      try {
        // Send main notice info message
        await ctx.telegram.sendMessage(adminId, adminNoticeText, { parse_mode: 'HTML' });

        // Send Chek (Receipt)
        if (isPhoto) {
          await ctx.telegram.sendPhoto(adminId, receiptFileId, {
            caption: `🧾 <b>To‘lov cheki</b> (Buyurtma #${order.orderNumber})`,
            parse_mode: 'HTML',
          });
        } else {
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
              ...AdminKeyboard.getOrderActionKeyboard(order.id, OrderStatus.IN_PROGRESS),
            });
          } catch (e) {
            await ctx.telegram.sendPhoto(adminId, order.fileId, {
              caption: docCaption,
              parse_mode: 'HTML',
              ...AdminKeyboard.getOrderActionKeyboard(order.id, OrderStatus.IN_PROGRESS),
            });
          }
        }
      } catch (err) {
        logger.error(`Failed to notify admin ${adminId}:`, err);
      }
    }
  });

  // Action callback: "✅ Confirm Payment" (legacy/manual check)
  bot.action('check_payment', async (ctx) => {
    const telegramId = ctx.from.id;
    const lang = ctx.language;
    const sessionData = (ctx.dbUser?.stepData || {}) as SessionData;

    if (!sessionData.currentOrderId) {
      await ctx.answerCbQuery('Order not found');
      return;
    }

    const order = await orderService.getOrderDetails(sessionData.currentOrderId);
    if (!order) {
      await ctx.answerCbQuery('Order not found');
      return;
    }

    await userService.updateStep(telegramId, UserStep.IN_PROGRESS, {});
    await ctx.answerCbQuery('Payment Confirmed!');

    const service = await serviceRepository.findById(order.serviceId);
    let serviceName = service?.nameUz || '';
    if (lang === 'ru') serviceName = service?.nameRu || serviceName;
    if (lang === 'en') serviceName = service?.nameEn || serviceName;

    const successText = t(lang, 'payment_success', {
      orderNumber: order.orderNumber,
      serviceName,
      totalPrice: Number(order.totalPrice).toLocaleString(),
    });

    const isAdmin = env.ADMIN_IDS.includes(telegramId);
    await ctx.reply(successText, {
      parse_mode: 'HTML',
      ...CommonKeyboard.getMainMenu(lang, isAdmin),
    });
  });
}
