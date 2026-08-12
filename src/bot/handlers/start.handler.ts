import { Telegraf } from 'telegraf';
import { BotContext, UserStep } from '../../types';
import { userService } from '../../services/user/user.service';
import { CommonKeyboard } from '../keyboards/common.keyboard';
import { env } from '../../config/env.config';
import { t } from '../../utils/i18n.util';

export function registerStartHandler(bot: Telegraf<BotContext>) {
  bot.command('start', async (ctx) => {
    const telegramId = ctx.from.id;
    const isAdmin = env.ADMIN_IDS.includes(telegramId);

    // Always start by asking language or transitioning to main menu if already registered
    const user = await userService.getOrCreateUser(telegramId, ctx.from.username);

    if (user.phone && user.firstName) {
      // User is fully registered, send main menu
      await userService.updateStep(telegramId, UserStep.MAIN_MENU);
      await ctx.reply(
        t(ctx.language, 'main_menu_title'),
        CommonKeyboard.getMainMenu(ctx.language, isAdmin)
      );
      return;
    }

    // Prompt for language selection
    await userService.updateStep(telegramId, UserStep.SELECT_LANGUAGE);
    await ctx.reply(
      t(ctx.language, 'select_language'),
      CommonKeyboard.getLanguageKeyboard()
    );
  });

  bot.command('restart', async (ctx) => {
    const telegramId = ctx.from.id;
    const isAdmin = env.ADMIN_IDS.includes(telegramId);

    const user = await userService.getOrCreateUser(telegramId, ctx.from.username);
    await userService.updateStep(telegramId, UserStep.MAIN_MENU, {});

    if (user.phone && user.firstName) {
      await ctx.reply(
        t(ctx.language, 'main_menu_title'),
        CommonKeyboard.getMainMenu(ctx.language, isAdmin)
      );
    } else {
      await userService.updateStep(telegramId, UserStep.SELECT_LANGUAGE);
      await ctx.reply(
        t(ctx.language, 'select_language'),
        CommonKeyboard.getLanguageKeyboard()
      );
    }
  });

  bot.action(/^lang_(uz|ru|en)$/, async (ctx) => {
    const lang = ctx.match[1] as 'uz' | 'ru' | 'en';
    const telegramId = ctx.from.id;
    const isAdmin = env.ADMIN_IDS.includes(telegramId);

    ctx.language = lang;
    const dbLang = lang.toUpperCase() as any;
    await userService.setLanguage(telegramId, dbLang);

    // If user is already registered, switch language and show main menu
    if (ctx.dbUser?.phone && ctx.dbUser?.firstName) {
      await userService.updateStep(telegramId, UserStep.MAIN_MENU);
      await ctx.answerCbQuery();
      await ctx.reply(
        t(lang, 'main_menu_title'),
        CommonKeyboard.getMainMenu(lang, isAdmin)
      );
      return;
    }

    // Otherwise move to step 1 of registration: Surname
    await userService.updateStep(telegramId, UserStep.ENTER_LAST_NAME, { language: lang });
    await ctx.answerCbQuery();
    await ctx.reply(t(lang, 'enter_last_name'));
  });
}
