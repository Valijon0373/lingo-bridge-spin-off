import { Telegraf } from 'telegraf';
import { BotContext, UserStep, SessionData } from '../../types';
import { serviceRepository } from '../../database/repositories/service.repository';
import { userService } from '../../services/user/user.service';
import { ServiceKeyboard } from '../keyboards/service.keyboard';
import { CommonKeyboard } from '../keyboards/common.keyboard';
import { env } from '../../config/env.config';
import { t } from '../../utils/i18n.util';

export function registerServiceHandler(bot: Telegraf<BotContext>) {
  // Main menu "📄 Tarjima xizmatlari" button click
  bot.hears([t('uz', 'btn_services'), t('ru', 'btn_services'), t('en', 'btn_services')], async (ctx) => {
    await showServicesCatalog(ctx);
  });

  // Service selection inline button click (e.g. srv_1234)
  bot.action(/^srv_(.+)$/, async (ctx) => {
    const serviceId = ctx.match[1];
    const telegramId = ctx.from.id;
    const lang = ctx.language;

    const service = await serviceRepository.findById(serviceId);
    if (!service) {
      await ctx.answerCbQuery('Service not found');
      return;
    }

    const sessionData: SessionData = {
      ...(ctx.dbUser?.stepData as SessionData),
      selectedServiceId: service.id,
    };

    await userService.updateStep(telegramId, UserStep.SELECT_TRANSLATION_DIRECTION, sessionData);

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

    const priceTypeStr = t(lang, `price_type_${service.priceType}`);
    const text = t(lang, 'service_detail', {
      name,
      description: desc,
      price: service.price.toLocaleString(),
      priceType: priceTypeStr,
    });

    await ctx.answerCbQuery();
    await ctx.reply(text, {
      parse_mode: 'HTML',
      ...ServiceKeyboard.getTranslationDirectionsKeyboard(lang),
    });
  });

  // Translation direction selection (e.g. dir_uz_ru)
  bot.action(/^dir_([a-z]+)_([a-z]+)$/, async (ctx) => {
    const srcLang = ctx.match[1];
    const tgtLang = ctx.match[2];
    const telegramId = ctx.from.id;
    const lang = ctx.language;

    const sessionData: SessionData = {
      ...(ctx.dbUser?.stepData as SessionData),
      sourceLanguage: srcLang.toUpperCase(),
      targetLanguage: tgtLang.toUpperCase(),
    };

    await userService.updateStep(telegramId, UserStep.UPLOAD_DOCUMENT, sessionData);

    await ctx.answerCbQuery();
    await ctx.reply(
      t(lang, 'upload_document_prompt'),
      {
        parse_mode: 'HTML',
        ...CommonKeyboard.getCancelOrBack(lang),
      }
    );
  });

  // Navigation handlers
  bot.action('nav_services_list', async (ctx) => {
    await ctx.answerCbQuery();
    await showServicesCatalog(ctx);
  });

  bot.action('nav_main_menu', async (ctx) => {
    const telegramId = ctx.from.id;
    const lang = ctx.language;
    const isAdmin = env.ADMIN_IDS.includes(telegramId);
    await userService.updateStep(telegramId, UserStep.MAIN_MENU);
    await ctx.answerCbQuery();
    await ctx.reply(t(lang, 'main_menu_title'), CommonKeyboard.getMainMenu(lang, isAdmin));
  });
}

export async function showServicesCatalog(ctx: BotContext) {
  const telegramId = ctx.from!.id;
  const lang = ctx.language;

  const services = await serviceRepository.findAllActive();
  await userService.updateStep(telegramId, UserStep.SELECT_SERVICE);

  await ctx.reply(t(lang, 'select_service'), {
    parse_mode: 'HTML',
    ...ServiceKeyboard.getServicesListKeyboard(services, lang),
  });
}
