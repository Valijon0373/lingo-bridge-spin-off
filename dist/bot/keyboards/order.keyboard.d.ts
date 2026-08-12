import { Markup } from 'telegraf';
export declare class OrderKeyboard {
    static getSummaryKeyboard(lang: string): Markup.Markup<import("@telegraf/types").InlineKeyboardMarkup>;
    static getPaymentUrlKeyboard(paymentUrl: string, lang: string): Markup.Markup<import("@telegraf/types").InlineKeyboardMarkup>;
    static getFailedPaymentKeyboard(lang: string): Markup.Markup<import("@telegraf/types").InlineKeyboardMarkup>;
}
