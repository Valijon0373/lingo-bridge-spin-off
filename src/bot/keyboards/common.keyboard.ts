import { Markup } from 'telegraf';
import { t } from '../../utils/i18n.util';

export class CommonKeyboard {
  public static getLanguageKeyboard() {
    return Markup.inlineKeyboard([
      [Markup.button.callback('🇺🇿 O‘zbek tili', 'lang_uz')],
      [Markup.button.callback('🇷🇺 Русский', 'lang_ru')],
      [Markup.button.callback('🇬🇧 English', 'lang_en')],
    ]);
  }

  public static getMainMenu(lang: string, _isAdmin = false) {
    const buttons = [
      [t(lang, 'btn_services')],
      [t(lang, 'btn_my_orders'), t(lang, 'btn_profile')],
      [t(lang, 'btn_help'), t(lang, 'btn_change_lang')],
    ];
    return Markup.keyboard(buttons).resize();
  }

  public static getCancelOrBack(lang: string, showBack = true) {
    const buttons = [];
    if (showBack) buttons.push(t(lang, 'btn_back'));
    buttons.push(t(lang, 'btn_cancel'));
    return Markup.keyboard([buttons]).resize();
  }
}
