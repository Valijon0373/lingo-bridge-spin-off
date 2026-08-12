import { Markup } from 'telegraf';
export declare class CommonKeyboard {
    static getLanguageKeyboard(): Markup.Markup<import("@telegraf/types").InlineKeyboardMarkup>;
    static getMainMenu(lang: string, _isAdmin?: boolean): Markup.Markup<import("@telegraf/types").ReplyKeyboardMarkup>;
    static getCancelOrBack(lang: string, showBack?: boolean): Markup.Markup<import("@telegraf/types").ReplyKeyboardMarkup>;
}
