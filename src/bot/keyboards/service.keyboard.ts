import { Markup } from 'telegraf';
import { Service } from '@prisma/client';
import { t } from '../../utils/i18n.util';

export class ServiceKeyboard {
  public static getServicesListKeyboard(services: Service[], lang: string) {
    const buttons = services.map((s) => {
      let name = s.nameUz;
      if (lang === 'ru') name = s.nameRu;
      if (lang === 'en') name = s.nameEn;
      return [Markup.button.callback(name, `srv_${s.id}`)];
    });

    buttons.push([Markup.button.callback(t(lang, 'btn_main_menu'), 'nav_main_menu')]);

    return Markup.inlineKeyboard(buttons);
  }

  public static getTranslationDirectionsKeyboard(lang: string) {
    return Markup.inlineKeyboard([
      [
        Markup.button.callback('🇺🇿 O‘zbek → 🇷🇺 Rus', 'dir_uz_ru'),
        Markup.button.callback('🇷🇺 Rus → 🇺🇿 O‘zbek', 'dir_ru_uz'),
      ],
      [
        Markup.button.callback('🇺🇿 O‘zbek → 🇬🇧 Ingliz', 'dir_uz_en'),
        Markup.button.callback('🇬🇧 Ingliz → 🇺🇿 O‘zbek', 'dir_en_uz'),
      ],
      [
        Markup.button.callback('🇷🇺 Rus → 🇬🇧 Ingliz', 'dir_ru_en'),
        Markup.button.callback('🇬🇧 Ingliz → 🇷🇺 Rus', 'dir_en_ru'),
      ],
      [Markup.button.callback(t(lang, 'btn_back'), 'nav_services_list')],
    ]);
  }
}
