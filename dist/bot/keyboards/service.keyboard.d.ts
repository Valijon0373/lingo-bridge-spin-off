import { Markup } from 'telegraf';
import { Service } from '@prisma/client';
export declare class ServiceKeyboard {
    static getServicesListKeyboard(services: Service[], lang: string): Markup.Markup<import("@telegraf/types").InlineKeyboardMarkup>;
    static getTranslationDirectionsKeyboard(lang: string): Markup.Markup<import("@telegraf/types").InlineKeyboardMarkup>;
}
