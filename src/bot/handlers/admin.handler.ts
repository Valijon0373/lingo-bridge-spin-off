import { Telegraf } from 'telegraf';
import { BotContext, UserStep, SessionData } from '../../types';
import { adminMiddleware } from '../middlewares/admin.middleware';
import { userRepository } from '../../database/repositories/user.repository';
import { orderRepository } from '../../database/repositories/order.repository';
import { serviceRepository } from '../../database/repositories/service.repository';
import { userService } from '../../services/user/user.service';
import { orderService } from '../../services/order/order.service';
import { excelService } from '../../services/excel/excel.service';
import { AdminKeyboard } from '../keyboards/admin.keyboard';
import { CommonKeyboard } from '../keyboards/common.keyboard';
import { OrderStatus, PriceType } from '@prisma/client';
import { logger } from '../../config/logger.config';
import { t } from '../../utils/i18n.util';

export function registerAdminHandler(bot: Telegraf<BotContext>) {
  // `/admin` command - entry point guarded by adminMiddleware
  bot.command('admin', adminMiddleware, async (ctx) => {
    await showAdminDashboard(ctx);
  });

  // `/excel` command guarded by adminMiddleware
  bot.command('excel', adminMiddleware, async (ctx) => {
    await handleExportOrdersExcel(ctx);
  });

  // Action: Dashboard menu button
  bot.action('admin_menu', adminMiddleware, async (ctx) => {
    await ctx.answerCbQuery();
    await showAdminDashboard(ctx);
  });

  // Action: Export orders to Excel
  bot.action('admin_export_excel', adminMiddleware, async (ctx) => {
    await handleExportOrdersExcel(ctx);
  });

  // Main menu Excel export button click
  bot.hears(
    [
      t('uz', 'btn_excel_export'),
      t('ru', 'btn_excel_export'),
      t('en', 'btn_excel_export'),
      '📊 Excel yuklash (admin uchun)',
      '📊 Excel (admin uchun)',
    ],
    adminMiddleware,
    async (ctx) => {
      await handleExportOrdersExcel(ctx);
    }
  );

  // Action: Close dashboard
  bot.action('admin_close', adminMiddleware, async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.deleteMessage().catch(() => {});
  });

  // Action: Show Statistics
  bot.action('admin_stats', adminMiddleware, async (ctx) => {
    const userCount = await userRepository.countAll();
    const orderCount = await orderRepository.countAll();
    const totalRevenue = await orderRepository.getTotalRevenue();
    const inProgressCount = await orderRepository.countByStatus(OrderStatus.IN_PROGRESS);
    const completedCount = await orderRepository.countByStatus(OrderStatus.COMPLETED);
    const cancelledCount = await orderRepository.countByStatus(OrderStatus.CANCELLED);

    const statsText = `📊 <b>Statistika</b>\n\n` +
      `👥 Foydalanuvchilar: <b>${userCount}</b>\n` +
      `📦 Buyurtmalar: <b>${orderCount}</b>\n` +
      `💰 Umumiy tushum: <b>${totalRevenue.toLocaleString()} so‘m</b>\n\n` +
      `⏳ Jarayondagi buyurtmalar: <b>${inProgressCount}</b>\n` +
      `✅ Tugallangan: <b>${completedCount}</b>\n` +
      `❌ Bekor qilingan: <b>${cancelledCount}</b>`;

    await ctx.answerCbQuery();
    await ctx.reply(statsText, {
      parse_mode: 'HTML',
      ...AdminKeyboard.getAdminDashboardKeyboard(),
    });
  });

  // Action: View Recent Orders
  bot.action('admin_orders', adminMiddleware, async (ctx) => {
    const orders = await orderRepository.findAllRecent(10);
    await ctx.answerCbQuery();

    if (orders.length === 0) {
      await ctx.reply('📦 Buyurtmalar yo‘q.', AdminKeyboard.getAdminDashboardKeyboard());
      return;
    }

    await ctx.reply('📦 <b>So‘nggi 10 ta buyurtma:</b>', { parse_mode: 'HTML' });

    for (const order of orders) {
      const orderUser = order.user;
      const orderText = `#{order.orderNumber}\n` +
        `👤 User: ${orderUser?.lastName || ''} ${orderUser?.firstName || ''} (${orderUser?.phone || ''})\n` +
        `🌐 Dir: ${order.sourceLanguage} → ${order.targetLanguage}\n` +
        `📄 Pages: ${order.pageCount}\n` +
        `💰 Total: ${Number(order.totalPrice).toLocaleString()} UZS\n` +
        `Status: ${order.status}`;

      await ctx.reply(orderText, AdminKeyboard.getOrderActionKeyboard(order.id, order.status));
    }
  });

  // Action: Update order status (e.g. adm_st_PAID_uuid)
  bot.action(/^adm_st_([A-Z_]+)_(.+)$/, adminMiddleware, async (ctx) => {
    const statusStr = ctx.match[1] as OrderStatus;
    const orderId = ctx.match[2];

    await orderService.updateStatus(orderId, statusStr);
    await ctx.answerCbQuery(`Status change to ${statusStr}`);
    await ctx.reply(`✅ Order status updated to <b>${statusStr}</b>`, { parse_mode: 'HTML' });
  });

  // Action: Trigger result file upload for order (adm_attach_uuid)
  bot.action(/^adm_attach_(.+)$/, adminMiddleware, async (ctx) => {
    const orderId = ctx.match[1];
    const telegramId = ctx.from.id;

    await userService.updateStep(telegramId, UserStep.ADMIN_UPLOAD_RESULT, {
      targetOrderIdForUpload: orderId,
    });

    await ctx.answerCbQuery();
    await ctx.reply(`📎 Iltimos, tayyor tarjima qilingan faylni yuboring (Order #${orderId}).`);
  });

  // Document/Photo handler for Admin Upload Result
  bot.on(['document', 'photo'], adminMiddleware, async (ctx, next) => {
    const step = ctx.dbUser?.step;
    if (step !== UserStep.ADMIN_UPLOAD_RESULT) return next();

    const sessionData = (ctx.dbUser?.stepData || {}) as SessionData;
    const orderId = sessionData.targetOrderIdForUpload;

    if (!orderId) {
      await ctx.reply('❌ Buyurtma topilmadi.');
      return;
    }

    let fileId = '';
    let isPhoto = false;
    if (ctx.message && 'document' in ctx.message) {
      fileId = ctx.message.document.file_id;
    } else if (ctx.message && 'photo' in ctx.message) {
      const photos = ctx.message.photo;
      fileId = photos[photos.length - 1].file_id;
      isPhoto = true;
    }

    const order = await orderService.attachResult(orderId, fileId);
    await userService.updateStep(ctx.from.id, UserStep.ADMIN_MENU);

    await ctx.reply(`✅ Buyurtma #${order.orderNumber} tugallandi va foydalanuvchiga yuborildi!`);

    // Notify user with finished document
    try {
      const targetUser = await userRepository.findByTelegramId(order.user.telegramId);
      const userLang = targetUser?.language?.toLowerCase() || 'uz';

      const userMsg = t(userLang, 'order_completed_user', {
        orderNumber: order.orderNumber,
        serviceName: order.service?.nameUz || '',
      });

      await ctx.telegram.sendMessage(Number(order.user.telegramId), userMsg, { parse_mode: 'HTML' });
      if (isPhoto) {
        await ctx.telegram.sendPhoto(Number(order.user.telegramId), fileId);
      } else {
        await ctx.telegram.sendDocument(Number(order.user.telegramId), fileId);
      }
    } catch (err) {
      logger.error('Failed to notify user with completion document:', err);
    }
  });

  // Action: Service management (Xizmatlarni tahrirlash / boshqarish)
  bot.action('admin_services', adminMiddleware, async (ctx) => {
    const services = await serviceRepository.findAll();
    await ctx.answerCbQuery();

    if (services.length === 0) {
      await ctx.reply('📄 Hozircha hech qanday xizmat mavjud emas.', AdminKeyboard.getAdminDashboardKeyboard());
      return;
    }

    const mapped = services.map((s) => ({
      id: s.id,
      nameUz: s.nameUz,
      isActive: s.isActive,
      price: Number(s.price),
    }));

    await ctx.reply('📄 <b>Xizmatlar ro‘yxati (batafsil ko‘rish yoki tahrirlash uchun bosing):</b>', {
      parse_mode: 'HTML',
      ...AdminKeyboard.getServiceManagementKeyboard(mapped),
    });
  });

  // Action: View service detail
  bot.action(/^adm_srv_detail_(.+)$/, adminMiddleware, async (ctx) => {
    const serviceId = ctx.match[1];
    const service = await serviceRepository.findById(serviceId);
    await ctx.answerCbQuery();

    if (!service) {
      await ctx.reply('❌ Xizmat topilmadi.');
      return;
    }

    const text = `📄 <b>Xizmat ma'lumotlari:</b>\n\n` +
      `📌 <b>Nomi:</b> ${service.nameUz}\n` +
      `💰 <b>Narxi:</b> ${Number(service.price).toLocaleString()} so‘m\n` +
      `⚡ <b>Holati:</b> ${service.isActive ? '🟢 Faol' : '🔴 Nofaol'}`;

    await ctx.reply(text, {
      parse_mode: 'HTML',
      ...AdminKeyboard.getServiceDetailsKeyboard(service.id, service.isActive),
    });
  });

  // Action: Toggle service active state
  bot.action(/^adm_srv_toggle_(.+)$/, adminMiddleware, async (ctx) => {
    const serviceId = ctx.match[1];
    const service = await serviceRepository.findById(serviceId);

    if (service) {
      const updated = await serviceRepository.toggleActive(serviceId, !service.isActive);
      await ctx.answerCbQuery(`Xizmat holati o'zgartirildi: ${updated.isActive ? 'Faol' : 'Nofaol'}`);

      const text = `📄 <b>Xizmat ma'lumotlari:</b>\n\n` +
        `📌 <b>Nomi:</b> ${updated.nameUz}\n` +
        `💰 <b>Narxi:</b> ${Number(updated.price).toLocaleString()} so‘m\n` +
        `⚡ <b>Holati:</b> ${updated.isActive ? '🟢 Faol' : '🔴 Nofaol'}`;

      await ctx.editMessageText(text, {
        parse_mode: 'HTML',
        ...AdminKeyboard.getServiceDetailsKeyboard(updated.id, updated.isActive),
      }).catch(() => {});
    }
  });

  // Action: Edit service name trigger
  bot.action(/^adm_srv_edit_name_(.+)$/, adminMiddleware, async (ctx) => {
    const serviceId = ctx.match[1];
    const telegramId = ctx.from.id;

    await userService.updateStep(telegramId, UserStep.ADMIN_EDIT_SERVICE_NAME, {
      editingServiceId: serviceId,
    });

    await ctx.answerCbQuery();
    await ctx.reply('✏️ <b>Xizmatning yangi nomini kiriting:</b>', { parse_mode: 'HTML' });
  });

  // Action: Edit service price trigger
  bot.action(/^adm_srv_edit_price_(.+)$/, adminMiddleware, async (ctx) => {
    const serviceId = ctx.match[1];
    const telegramId = ctx.from.id;

    await userService.updateStep(telegramId, UserStep.ADMIN_EDIT_SERVICE_PRICE, {
      editingServiceId: serviceId,
    });

    await ctx.answerCbQuery();
    await ctx.reply('💰 <b>Xizmatning yangi narxini kiriting (so‘mda, masalan: 40000):</b>', { parse_mode: 'HTML' });
  });

  // Action: Add service wizard trigger
  bot.action('admin_add_service', adminMiddleware, async (ctx) => {
    const telegramId = ctx.from.id;
    await userService.updateStep(telegramId, UserStep.ADMIN_ADD_SERVICE_NAME_UZ, {});
    await ctx.answerCbQuery();
    await ctx.reply('➕ <b>Yangi xizmat nomi (O‘zbekcha):</b>', { parse_mode: 'HTML' });
  });

  // Action: Broadcast trigger
  bot.action('admin_broadcast', adminMiddleware, async (ctx) => {
    const telegramId = ctx.from.id;
    await userService.updateStep(telegramId, UserStep.ADMIN_BROADCAST, {});
    await ctx.answerCbQuery();
    await ctx.reply('📢 <b>Barcha foydalanuvchilarga yuboriladigan xabar matnini kiriting:</b>', {
      parse_mode: 'HTML',
    });
  });

  // Text Handler for Admin steps (Add Service, Edit Service Name/Price, Broadcast)
  bot.on('text', adminMiddleware, async (ctx, next) => {
    const step = ctx.dbUser?.step;
    const text = ctx.message.text.trim();
    const telegramId = ctx.from.id;
    const sessionData = (ctx.dbUser?.stepData || {}) as SessionData;

    if (step === UserStep.ADMIN_ADD_SERVICE_NAME_UZ) {
      sessionData.tempLastName = text;
      await userService.updateStep(telegramId, UserStep.ADMIN_ADD_SERVICE_PRICE, sessionData);
      await ctx.reply('💰 <b>Xizmat narxini kiriting (so‘mda, masalan: 35000):</b>', { parse_mode: 'HTML' });
      return;
    }

    if (step === UserStep.ADMIN_ADD_SERVICE_PRICE) {
      const price = parseInt(text, 10);
      if (isNaN(price) || price <= 0) {
        await ctx.reply('❌ Iltimos, to‘g‘ri son kiriting.');
        return;
      }

      const nameUz = sessionData.tempLastName || 'Yangi xizmat';
      await serviceRepository.create({
        nameUz,
        nameRu: nameUz,
        nameEn: nameUz,
        descriptionUz: nameUz,
        descriptionRu: nameUz,
        descriptionEn: nameUz,
        price,
        priceType: PriceType.PER_PAGE,
      });

      await userService.updateStep(telegramId, UserStep.ADMIN_MENU, {});
      await ctx.reply(`✅ Xizmat muvaffaqiyatli qo‘shildi: <b>${nameUz}</b> (${price.toLocaleString()} so‘m)`, { parse_mode: 'HTML' });
      await showAdminDashboard(ctx);
      return;
    }

    if (step === UserStep.ADMIN_EDIT_SERVICE_NAME) {
      const serviceId = sessionData.editingServiceId;
      if (!serviceId) {
        await ctx.reply('❌ Xizmat topilmadi.');
        await userService.updateStep(telegramId, UserStep.ADMIN_MENU, {});
        return;
      }

      await serviceRepository.updateName(serviceId, text);
      await userService.updateStep(telegramId, UserStep.ADMIN_MENU, {});
      await ctx.reply(`✅ Xizmat nomi muvaffaqiyatli o‘zgartirildi: <b>${text}</b>`, { parse_mode: 'HTML' });

      const updatedService = await serviceRepository.findById(serviceId);
      if (updatedService) {
        const textMsg = `📄 <b>Xizmat ma'lumotlari:</b>\n\n` +
          `📌 <b>Nomi:</b> ${updatedService.nameUz}\n` +
          `💰 <b>Narxi:</b> ${Number(updatedService.price).toLocaleString()} so‘m\n` +
          `⚡ <b>Holati:</b> ${updatedService.isActive ? '🟢 Faol' : '🔴 Nofaol'}`;

        await ctx.reply(textMsg, {
          parse_mode: 'HTML',
          ...AdminKeyboard.getServiceDetailsKeyboard(updatedService.id, updatedService.isActive),
        });
      }
      return;
    }

    if (step === UserStep.ADMIN_EDIT_SERVICE_PRICE) {
      const serviceId = sessionData.editingServiceId;
      if (!serviceId) {
        await ctx.reply('❌ Xizmat topilmadi.');
        await userService.updateStep(telegramId, UserStep.ADMIN_MENU, {});
        return;
      }

      const price = parseInt(text, 10);
      if (isNaN(price) || price <= 0) {
        await ctx.reply('❌ Iltimos, to‘g‘ri son kiriting.');
        return;
      }

      await serviceRepository.updatePrice(serviceId, price);
      await userService.updateStep(telegramId, UserStep.ADMIN_MENU, {});
      await ctx.reply(`✅ Xizmat narxi muvaffaqiyatli o‘zgartirildi: <b>${price.toLocaleString()} so‘m</b>`, { parse_mode: 'HTML' });

      const updatedService = await serviceRepository.findById(serviceId);
      if (updatedService) {
        const textMsg = `📄 <b>Xizmat ma'lumotlari:</b>\n\n` +
          `📌 <b>Nomi:</b> ${updatedService.nameUz}\n` +
          `💰 <b>Narxi:</b> ${Number(updatedService.price).toLocaleString()} so‘m\n` +
          `⚡ <b>Holati:</b> ${updatedService.isActive ? '🟢 Faol' : '🔴 Nofaol'}`;

        await ctx.reply(textMsg, {
          parse_mode: 'HTML',
          ...AdminKeyboard.getServiceDetailsKeyboard(updatedService.id, updatedService.isActive),
        });
      }
      return;
    }

    if (step === UserStep.ADMIN_BROADCAST) {
      await userService.updateStep(telegramId, UserStep.ADMIN_MENU, {});
      const users = await userRepository.findAll();

      await ctx.reply(`📢 Xabar ${users.length} ta foydalanuvchiga yuborilmoqda...`);

      let successCount = 0;
      for (const u of users) {
        try {
          await ctx.telegram.sendMessage(Number(u.telegramId), text);
          successCount++;
        } catch (err) {
          logger.warn(`Failed to send broadcast to ${u.telegramId}`);
        }
      }

      await ctx.reply(`✅ Broadcast yakunlandi. ${successCount}/${users.length} ta foydalanuvchiga yetkazildi.`);
      return;
    }

    return next();
  });
}

async function showAdminDashboard(ctx: BotContext) {
  await ctx.reply('🛠 <b>Admin Boshqaruv Paneli</b>\n\nKerakli bo‘limni tanlang:', {
    parse_mode: 'HTML',
    ...AdminKeyboard.getAdminDashboardKeyboard(),
  });
}

async function handleExportOrdersExcel(ctx: BotContext) {
  if ('callback_query' in ctx.update) {
    await ctx.answerCbQuery('Excel fayl tayyorlanmoqda...').catch(() => {});
  }

  const loadingMsg = await ctx.reply('⏳ Buyurtmalar Excel fayli shakllantirilmoqda, iltimos kuting...');

  try {
    const excelBuffer = await excelService.generateOrdersExcel();
    const fileName = `buyurtmalar_${new Date().toISOString().slice(0, 10)}.xlsx`;

    await ctx.replyWithDocument(
      {
        source: excelBuffer,
        filename: fileName,
      },
      {
        caption: '📊 <b>Barcha buyurtmalar ro‘yxati (Excel)</b>',
        parse_mode: 'HTML',
      }
    );
  } catch (error) {
    logger.error('Error exporting orders to Excel:', error);
    await ctx.reply('❌ Excel faylini yaratishda xatolik yuz berdi.');
  } finally {
    if (loadingMsg) {
      await ctx.deleteMessage(loadingMsg.message_id).catch(() => {});
    }
  }
}

