import { Telegraf } from 'telegraf';
import { BotContext, UserStep, SessionData } from '../../types';
import { userService } from '../../services/user/user.service';
import { orderService } from '../../services/order/order.service';
import { serviceRepository } from '../../database/repositories/service.repository';
import { PdfService } from '../../services/pdf/pdf.service';
import { OrderKeyboard } from '../keyboards/order.keyboard';
import { ServiceKeyboard } from '../keyboards/service.keyboard';
import { CommonKeyboard } from '../keyboards/common.keyboard';
import { ValidatorUtil } from '../../utils/validator.util';
import { env } from '../../config/env.config';
import { t } from '../../utils/i18n.util';
import { PriceType } from '@prisma/client';

export function registerOrderHandler(bot: Telegraf<BotContext>) {
  // Handle document upload
  bot.on(['document', 'photo'], async (ctx, next) => {
    const step = ctx.dbUser?.step;
    if (step !== UserStep.UPLOAD_DOCUMENT) return next();

    const telegramId = ctx.from.id;
    const lang = ctx.language;
    const sessionData = (ctx.dbUser?.stepData || {}) as SessionData;

    let fileId = '';
    let fileName = 'document';
    let mimeType = '';

    if (ctx.message && 'document' in ctx.message) {
      fileId = ctx.message.document.file_id;
      fileName = ctx.message.document.file_name || 'document.pdf';
      mimeType = ctx.message.document.mime_type || '';
    } else if (ctx.message && 'photo' in ctx.message) {
      // Pick highest resolution photo
      const photoArray = ctx.message.photo;
      fileId = photoArray[photoArray.length - 1].file_id;
      fileName = 'photo.jpg';
      mimeType = 'image/jpeg';
    }

    if (!ValidatorUtil.isSupportedFile(fileName, mimeType)) {
      await ctx.reply(t(lang, 'invalid_file_format'));
      return;
    }

    sessionData.fileId = fileId;
    sessionData.fileName = fileName;

    // Check service price type
    const service = await serviceRepository.findById(sessionData.selectedServiceId || '');
    if (!service) {
      await ctx.reply(t(lang, 'invalid_text_input'));
      return;
    }

    // Attempt automatic PDF page count if it is a PDF file
    let autoPages: number | null = null;
    if (fileName.toLowerCase().endsWith('.pdf') || mimeType === 'application/pdf') {
      try {
        const fileLink = await ctx.telegram.getFileLink(fileId);
        autoPages = await PdfService.getPdfPageCountFromUrl(fileLink.toString());
      } catch (err) {
        autoPages = null;
      }
    }

    if (service.priceType === PriceType.FIXED) {
      sessionData.pageCount = 1;
      await createAndShowOrderSummary(ctx, sessionData);
    } else if (autoPages && autoPages > 0) {
      sessionData.pageCount = autoPages;
      await ctx.reply(t(lang, 'pdf_auto_detected', { pages: autoPages }));
      await createAndShowOrderSummary(ctx, sessionData);
    } else {
      await userService.updateStep(telegramId, UserStep.ENTER_PAGE_COUNT, sessionData);
      await ctx.reply(t(lang, 'enter_page_count'), CommonKeyboard.getCancelOrBack(lang));
    }
  });

  // Handle manual page count entry
  bot.on('text', async (ctx, next) => {
    const step = ctx.dbUser?.step;
    if (step !== UserStep.ENTER_PAGE_COUNT) return next();

    const text = ctx.message.text.trim();
    const telegramId = ctx.from.id;
    const lang = ctx.language;
    const sessionData = (ctx.dbUser?.stepData || {}) as SessionData;

    const pages = parseInt(text, 10);
    if (isNaN(pages) || pages <= 0) {
      await ctx.reply(t(lang, 'invalid_page_count'));
      return;
    }

    sessionData.pageCount = pages;
    await createAndShowOrderSummary(ctx, sessionData);
  });

  // Action callback: cancel order
  bot.action('order_cancel', async (ctx) => {
    const telegramId = ctx.from.id;
    const lang = ctx.language;
    const isAdmin = env.ADMIN_IDS.includes(telegramId);

    await userService.updateStep(telegramId, UserStep.MAIN_MENU, {});
    await ctx.answerCbQuery();
    await ctx.reply(t(lang, 'main_menu_title'), CommonKeyboard.getMainMenu(lang, isAdmin));
  });

  // Action callback: edit order (restart service selection)
  bot.action('order_edit', async (ctx) => {
    const telegramId = ctx.from.id;
    const lang = ctx.language;
    await userService.updateStep(telegramId, UserStep.SELECT_SERVICE, {});
    await ctx.answerCbQuery();
    const services = await serviceRepository.findAllActive();
    await ctx.reply(t(lang, 'select_service'), ServiceKeyboard.getServicesListKeyboard(services, lang));
  });
}

export async function createAndShowOrderSummary(ctx: BotContext, sessionData: SessionData) {
  const telegramId = ctx.from!.id;
  const lang = ctx.language;

  if (!ctx.dbUser?.id || !sessionData.selectedServiceId) return;

  const order = await orderService.createOrder({
    userId: ctx.dbUser.id,
    serviceId: sessionData.selectedServiceId,
    sourceLanguage: sessionData.sourceLanguage || 'UZ',
    targetLanguage: sessionData.targetLanguage || 'RU',
    fileId: sessionData.fileId || '',
    fileName: sessionData.fileName || 'document',
    pageCount: sessionData.pageCount || 1,
  });

  sessionData.currentOrderId = order.id;
  await userService.updateStep(telegramId, UserStep.CONFIRM_ORDER, sessionData);

  const service = await serviceRepository.findById(order.serviceId);
  let serviceName = service?.nameUz || 'Service';
  if (lang === 'ru') serviceName = service?.nameRu || serviceName;
  if (lang === 'en') serviceName = service?.nameEn || serviceName;

  const priceTypeStr = t(lang, `price_type_${service?.priceType || 'PER_PAGE'}`);
  const directionStr = `🇺🇿 ${order.sourceLanguage} → 🇷🇺 ${order.targetLanguage}`;

  const summaryText = t(lang, 'order_summary', {
    serviceName,
    direction: directionStr,
    pages: order.pageCount,
    unitPrice: Number(order.unitPrice).toLocaleString(),
    priceType: priceTypeStr,
    totalPrice: Number(order.totalPrice).toLocaleString(),
  });

  await ctx.reply(summaryText, {
    parse_mode: 'HTML',
    ...OrderKeyboard.getSummaryKeyboard(lang),
  });
}
