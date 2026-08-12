"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceKeyboard = void 0;
const telegraf_1 = require("telegraf");
const i18n_util_1 = require("../../utils/i18n.util");
class ServiceKeyboard {
    static getServicesListKeyboard(services, lang) {
        const buttons = services.map((s) => {
            let name = s.nameUz;
            if (lang === 'ru')
                name = s.nameRu;
            if (lang === 'en')
                name = s.nameEn;
            return [telegraf_1.Markup.button.callback(name, `srv_${s.id}`)];
        });
        buttons.push([telegraf_1.Markup.button.callback((0, i18n_util_1.t)(lang, 'btn_main_menu'), 'nav_main_menu')]);
        return telegraf_1.Markup.inlineKeyboard(buttons);
    }
    static getTranslationDirectionsKeyboard(lang) {
        return telegraf_1.Markup.inlineKeyboard([
            [
                telegraf_1.Markup.button.callback('🇺🇿 O‘zbek → 🇷🇺 Rus', 'dir_uz_ru'),
                telegraf_1.Markup.button.callback('🇷🇺 Rus → 🇺🇿 O‘zbek', 'dir_ru_uz'),
            ],
            [
                telegraf_1.Markup.button.callback('🇺🇿 O‘zbek → 🇬🇧 Ingliz', 'dir_uz_en'),
                telegraf_1.Markup.button.callback('🇬🇧 Ingliz → 🇺🇿 O‘zbek', 'dir_en_uz'),
            ],
            [
                telegraf_1.Markup.button.callback('🇷🇺 Rus → 🇬🇧 Ingliz', 'dir_ru_en'),
                telegraf_1.Markup.button.callback('🇬🇧 Ingliz → 🇷🇺 Rus', 'dir_en_ru'),
            ],
            [telegraf_1.Markup.button.callback((0, i18n_util_1.t)(lang, 'btn_back'), 'nav_services_list')],
        ]);
    }
}
exports.ServiceKeyboard = ServiceKeyboard;
