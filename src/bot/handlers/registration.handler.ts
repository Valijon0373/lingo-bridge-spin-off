import { Telegraf } from 'telegraf';
import { BotContext, UserStep, SessionData } from '../../types';
import { userService } from '../../services/user/user.service';
import { RegistrationKeyboard } from '../keyboards/registration.keyboard';
import { CommonKeyboard } from '../keyboards/common.keyboard';
import { ValidatorUtil } from '../../utils/validator.util';
import { env } from '../../config/env.config';
import { t } from '../../utils/i18n.util';

export function registerRegistrationHandler(bot: Telegraf<BotContext>) {
  // Handle text responses during registration steps
  bot.on('text', async (ctx, next) => {
    const step = ctx.dbUser?.step;
    const text = ctx.message.text.trim();
    const telegramId = ctx.from.id;
    const lang = ctx.language;
    const isAdmin = env.ADMIN_IDS.includes(telegramId);

    // Handle cancel button click
    if (text === t(lang, 'btn_cancel')) {
      await userService.updateStep(telegramId, UserStep.MAIN_MENU);
      await ctx.reply(t(lang, 'main_menu_title'), CommonKeyboard.getMainMenu(lang, isAdmin));
      return;
    }

    const sessionData = (ctx.dbUser?.stepData || {}) as SessionData;

    if (step === UserStep.ENTER_LAST_NAME) {
      if (!ValidatorUtil.isValidName(text)) {
        await ctx.reply(t(lang, 'invalid_text_input'));
        return;
      }
      sessionData.tempLastName = text;
      await userService.updateStep(telegramId, UserStep.ENTER_FIRST_NAME, sessionData);
      await ctx.reply(t(lang, 'enter_first_name'));
      return;
    }

    if (step === UserStep.ENTER_FIRST_NAME) {
      if (!ValidatorUtil.isValidName(text)) {
        await ctx.reply(t(lang, 'invalid_text_input'));
        return;
      }
      sessionData.tempFirstName = text;
      await userService.updateStep(telegramId, UserStep.ENTER_PHONE, sessionData);
      await ctx.reply(
        t(lang, 'enter_phone'),
        RegistrationKeyboard.getPhoneKeyboard(lang)
      );
      return;
    }

    if (step === UserStep.ENTER_PHONE) {
      if (!ValidatorUtil.isValidPhoneNumber(text)) {
        await ctx.reply(t(lang, 'invalid_phone_input'));
        return;
      }
      const formattedPhone = ValidatorUtil.formatPhoneNumber(text);
      sessionData.tempPhone = formattedPhone;
      await showProfileConfirmation(ctx, sessionData);
      return;
    }

    return next();
  });

  // Handle Telegram contact share button
  bot.on('contact', async (ctx) => {
    const step = ctx.dbUser?.step;
    if (step !== UserStep.ENTER_PHONE) return;

    const contact = ctx.message.contact;
    const telegramId = ctx.from.id;
    const sessionData = (ctx.dbUser?.stepData || {}) as SessionData;

    const formattedPhone = ValidatorUtil.formatPhoneNumber(contact.phone_number);
    sessionData.tempPhone = formattedPhone;
    await showProfileConfirmation(ctx, sessionData);
  });

  // Action callbacks for profile confirmation
  bot.action('confirm_reg', async (ctx) => {
    const telegramId = ctx.from.id;
    const sessionData = (ctx.dbUser?.stepData || {}) as SessionData;
    const lang = ctx.language;

    if (sessionData.tempFirstName && sessionData.tempLastName && sessionData.tempPhone) {
      await userService.updateProfile(
        telegramId,
        sessionData.tempFirstName,
        sessionData.tempLastName,
        sessionData.tempPhone
      );
      const isAdmin = env.ADMIN_IDS.includes(telegramId);
      await userService.updateStep(telegramId, UserStep.MAIN_MENU, {});
      await ctx.answerCbQuery();
      await ctx.reply(t(lang, 'registration_complete'));
      await ctx.reply(t(lang, 'main_menu_title'), CommonKeyboard.getMainMenu(lang, isAdmin));
    }
  });

  bot.action('edit_reg', async (ctx) => {
    const telegramId = ctx.from.id;
    const lang = ctx.language;
    await userService.updateStep(telegramId, UserStep.ENTER_LAST_NAME, {});
    await ctx.answerCbQuery();
    await ctx.reply(t(lang, 'enter_last_name'));
  });
}

async function showProfileConfirmation(ctx: BotContext, sessionData: SessionData) {
  const telegramId = ctx.from!.id;
  const lang = ctx.language;

  await userService.updateStep(telegramId, UserStep.CONFIRM_PROFILE, sessionData);

  const confirmText = t(lang, 'confirm_profile_title', {
    lastName: sessionData.tempLastName || '',
    firstName: sessionData.tempFirstName || '',
    phone: sessionData.tempPhone || '',
  });

  await ctx.reply(confirmText, {
    parse_mode: 'HTML',
    ...RegistrationKeyboard.getConfirmationKeyboard(lang),
  });
}
