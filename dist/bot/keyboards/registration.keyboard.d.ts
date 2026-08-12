import { Markup } from 'telegraf';
export declare class RegistrationKeyboard {
    static getPhoneKeyboard(lang: string): Markup.Markup<import("@telegraf/types").ReplyKeyboardMarkup>;
    static getConfirmationKeyboard(lang: string): Markup.Markup<import("@telegraf/types").InlineKeyboardMarkup>;
}
