import { Telegraf } from 'telegraf';
import { BotContext, UserStep } from '../../types';
import { userService } from '../../services/user/user.service';
import { orderService } from '../../services/order/order.service';
import { serviceRepository } from '../../database/repositories/service.repository';
import { CommonKeyboard } from '../keyboards/common.keyboard';
import { env } from '../../config/env.config';
import { t } from '../../utils/i18n.util';

export function registerProfileHandler(bot: Telegraf<BotContext>) {
  // Main Menu "👤 Profilim" button
  bot.hears([t('uz', 'btn_profile'), t('ru', 'btn_profile'), t('en', 'btn_profile')], async (ctx) => {
    if (!ctx.dbUser) return;
    const lang = ctx.language;
    const isAdmin = env.ADMIN_IDS.includes(ctx.from?.id || 0);

    const stats = await userService.getUserProfileDetails(ctx.dbUser.id);
    let langName = '🇺🇿 O‘zbek';
    if (lang === 'ru') langName = '🇷🇺 Русский';
    if (lang === 'en') langName = '🇬🇧 English';

    const text = t(lang, 'profile_info', {
      lastName: ctx.dbUser.lastName || '',
      firstName: ctx.dbUser.firstName || '',
      phone: ctx.dbUser.phone || '',
      language: langName,
      orderCount: stats.orderCount,
      totalSpent: stats.totalSpent.toLocaleString(),
    });

    await ctx.reply(text, {
      parse_mode: 'HTML',
      ...CommonKeyboard.getMainMenu(lang, isAdmin),
    });
  });

  // Main Menu "📦 Mening buyurtmalarim" button
  bot.hears([t('uz', 'btn_my_orders'), t('ru', 'btn_my_orders'), t('en', 'btn_my_orders')], async (ctx) => {
    if (!ctx.dbUser) return;
    const lang = ctx.language;
    const isAdmin = env.ADMIN_IDS.includes(ctx.from?.id || 0);

    const orders = await orderService.getUserOrders(ctx.dbUser.id);

    if (orders.length === 0) {
      await ctx.reply(t(lang, 'no_orders'), CommonKeyboard.getMainMenu(lang, isAdmin));
      return;
    }

    await ctx.reply(t(lang, 'my_orders_title'), { parse_mode: 'HTML' });

    for (const order of orders) {
      const service = await serviceRepository.findById(order.serviceId);
      let serviceName = service?.nameUz || 'Service';
      if (lang === 'ru') serviceName = service?.nameRu || serviceName;
      if (lang === 'en') serviceName = service?.nameEn || serviceName;

      const statusStr = t(lang, `status_${order.status}`);
      const directionStr = `${order.sourceLanguage} → ${order.targetLanguage}`;

      const orderText = t(lang, 'order_item', {
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
  bot.hears([t('uz', 'btn_help'), t('ru', 'btn_help'), t('en', 'btn_help')], async (ctx) => {
    const lang = ctx.language;
    const isAdmin = env.ADMIN_IDS.includes(ctx.from?.id || 0);

    await ctx.reply(t(lang, 'help_text'), {
      parse_mode: 'HTML',
      ...CommonKeyboard.getMainMenu(lang, isAdmin),
    });
  });

  // Main Menu "🌐 Tilni o'zgartirish" button
  bot.hears([t('uz', 'btn_change_lang'), t('ru', 'btn_change_lang'), t('en', 'btn_change_lang')], async (ctx) => {
    const telegramId = ctx.from.id;
    const lang = ctx.language;

    await userService.updateStep(telegramId, UserStep.SELECT_LANGUAGE);
    await ctx.reply(t(lang, 'select_language'), CommonKeyboard.getLanguageKeyboard());
  });
}
