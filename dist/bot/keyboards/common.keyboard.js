"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonKeyboard = void 0;
const telegraf_1 = require("telegraf");
const i18n_util_1 = require("../../utils/i18n.util");
class CommonKeyboard {
    static getLanguageKeyboard() {
        return telegraf_1.Markup.inlineKeyboard([
            [telegraf_1.Markup.button.callback('🇺🇿 O‘zbek tili', 'lang_uz')],
            [telegraf_1.Markup.button.callback('🇷🇺 Русский', 'lang_ru')],
            [telegraf_1.Markup.button.callback('🇬🇧 English', 'lang_en')],
        ]);
    }
    static getMainMenu(lang, _isAdmin = false) {
        const buttons = [
            [(0, i18n_util_1.t)(lang, 'btn_services')],
            [(0, i18n_util_1.t)(lang, 'btn_my_orders'), (0, i18n_util_1.t)(lang, 'btn_profile')],
            [(0, i18n_util_1.t)(lang, 'btn_help'), (0, i18n_util_1.t)(lang, 'btn_change_lang')],
        ];
        return telegraf_1.Markup.keyboard(buttons).resize();
    }
    static getCancelOrBack(lang, showBack = true) {
        const buttons = [];
        if (showBack)
            buttons.push((0, i18n_util_1.t)(lang, 'btn_back'));
        buttons.push((0, i18n_util_1.t)(lang, 'btn_cancel'));
        return telegraf_1.Markup.keyboard([buttons]).resize();
    }
}
exports.CommonKeyboard = CommonKeyboard;
