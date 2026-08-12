"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderKeyboard = void 0;
const telegraf_1 = require("telegraf");
const i18n_util_1 = require("../../utils/i18n.util");
class OrderKeyboard {
    static getSummaryKeyboard(lang) {
        return telegraf_1.Markup.inlineKeyboard([
            [telegraf_1.Markup.button.callback((0, i18n_util_1.t)(lang, 'btn_pay'), 'order_pay')],
            [
                telegraf_1.Markup.button.callback((0, i18n_util_1.t)(lang, 'btn_edit'), 'order_edit'),
                telegraf_1.Markup.button.callback((0, i18n_util_1.t)(lang, 'btn_cancel'), 'order_cancel'),
            ],
        ]);
    }
    static getPaymentUrlKeyboard(paymentUrl, lang) {
        return telegraf_1.Markup.inlineKeyboard([
            [telegraf_1.Markup.button.url((0, i18n_util_1.t)(lang, 'btn_pay'), paymentUrl)],
            [telegraf_1.Markup.button.callback('✅ ' + (0, i18n_util_1.t)(lang, 'btn_confirm'), 'check_payment')],
            [telegraf_1.Markup.button.callback((0, i18n_util_1.t)(lang, 'btn_cancel'), 'order_cancel')],
        ]);
    }
    static getFailedPaymentKeyboard(lang) {
        return telegraf_1.Markup.inlineKeyboard([
            [telegraf_1.Markup.button.callback((0, i18n_util_1.t)(lang, 'btn_repay'), 'order_pay')],
            [telegraf_1.Markup.button.callback((0, i18n_util_1.t)(lang, 'btn_main_menu'), 'nav_main_menu')],
        ]);
    }
}
exports.OrderKeyboard = OrderKeyboard;
