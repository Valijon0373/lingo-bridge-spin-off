"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistrationKeyboard = void 0;
const telegraf_1 = require("telegraf");
const i18n_util_1 = require("../../utils/i18n.util");
class RegistrationKeyboard {
    static getPhoneKeyboard(lang) {
        return telegraf_1.Markup.keyboard([
            [telegraf_1.Markup.button.contactRequest((0, i18n_util_1.t)(lang, 'btn_send_contact'))],
            [(0, i18n_util_1.t)(lang, 'btn_cancel')],
        ]).resize();
    }
    static getConfirmationKeyboard(lang) {
        return telegraf_1.Markup.inlineKeyboard([
            [
                telegraf_1.Markup.button.callback((0, i18n_util_1.t)(lang, 'btn_confirm'), 'confirm_reg'),
                telegraf_1.Markup.button.callback((0, i18n_util_1.t)(lang, 'btn_edit'), 'edit_reg'),
            ],
        ]);
    }
}
exports.RegistrationKeyboard = RegistrationKeyboard;
