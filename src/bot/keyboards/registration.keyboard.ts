import { Markup } from 'telegraf';
import { t } from '../../utils/i18n.util';

export class RegistrationKeyboard {
  public static getPhoneKeyboard(lang: string) {
    return Markup.keyboard([
      [Markup.button.contactRequest(t(lang, 'btn_send_contact'))],
      [t(lang, 'btn_cancel')],
    ]).resize();
  }

  public static getConfirmationKeyboard(lang: string) {
    return Markup.inlineKeyboard([
      [
        Markup.button.callback(t(lang, 'btn_confirm'), 'confirm_reg'),
        Markup.button.callback(t(lang, 'btn_edit'), 'edit_reg'),
      ],
    ]);
  }
}
