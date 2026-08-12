import { Markup } from 'telegraf';
import { t } from '../../utils/i18n.util';

export class OrderKeyboard {
  public static getSummaryKeyboard(lang: string) {
    return Markup.inlineKeyboard([
      [Markup.button.callback(t(lang, 'btn_pay'), 'order_pay')],
      [
        Markup.button.callback(t(lang, 'btn_edit'), 'order_edit'),
        Markup.button.callback(t(lang, 'btn_cancel'), 'order_cancel'),
      ],
    ]);
  }

  public static getPaymentUrlKeyboard(paymentUrl: string, lang: string) {
    return Markup.inlineKeyboard([
      [Markup.button.url(t(lang, 'btn_pay'), paymentUrl)],
      [Markup.button.callback('✅ ' + t(lang, 'btn_confirm'), 'check_payment')],
      [Markup.button.callback(t(lang, 'btn_cancel'), 'order_cancel')],
    ]);
  }

  public static getFailedPaymentKeyboard(lang: string) {
    return Markup.inlineKeyboard([
      [Markup.button.callback(t(lang, 'btn_repay'), 'order_pay')],
      [Markup.button.callback(t(lang, 'btn_main_menu'), 'nav_main_menu')],
    ]);
  }
}
