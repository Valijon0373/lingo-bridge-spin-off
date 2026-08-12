import { Markup } from 'telegraf';
export declare class AdminKeyboard {
    static getAdminDashboardKeyboard(): Markup.Markup<import("@telegraf/types").InlineKeyboardMarkup>;
    static getOrderActionKeyboard(orderId: string, status: string): Markup.Markup<import("@telegraf/types").InlineKeyboardMarkup>;
    static getServiceManagementKeyboard(services: {
        id: string;
        nameUz: string;
        isActive: boolean;
        price: number;
    }[]): Markup.Markup<import("@telegraf/types").InlineKeyboardMarkup>;
    static getServiceDetailsKeyboard(serviceId: string, isActive: boolean): Markup.Markup<import("@telegraf/types").InlineKeyboardMarkup>;
}
