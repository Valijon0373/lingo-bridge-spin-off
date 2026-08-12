"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminKeyboard = void 0;
const telegraf_1 = require("telegraf");
class AdminKeyboard {
    static getAdminDashboardKeyboard() {
        return telegraf_1.Markup.inlineKeyboard([
            [
                telegraf_1.Markup.button.callback('📊 Statistika olish', 'admin_stats'),
                telegraf_1.Markup.button.callback('📢 Broadcast yuborish', 'admin_broadcast'),
            ],
            [
                telegraf_1.Markup.button.callback('➕ Yangi xizmat qo‘shish', 'admin_add_service'),
                telegraf_1.Markup.button.callback('📄 Xizmatlarni tahrirlash', 'admin_services'),
            ],
            [
                telegraf_1.Markup.button.callback('📦 Buyurtmalar', 'admin_orders'),
                telegraf_1.Markup.button.callback('📊 Excel yuklash', 'admin_export_excel'),
            ],
            [telegraf_1.Markup.button.callback('❌ Yopish', 'admin_close')],
        ]);
    }
    static getOrderActionKeyboard(orderId, status) {
        const buttons = [];
        if (status !== 'COMPLETED') {
            buttons.push([telegraf_1.Markup.button.callback('📎 Tayyor fayl biriktirish', `adm_attach_${orderId}`)]);
        }
        buttons.push([
            telegraf_1.Markup.button.callback('🟢 Paid', `adm_st_PAID_${orderId}`),
            telegraf_1.Markup.button.callback('🔵 In Progress', `adm_st_IN_PROGRESS_${orderId}`),
        ]);
        buttons.push([
            telegraf_1.Markup.button.callback('✅ Completed', `adm_st_COMPLETED_${orderId}`),
            telegraf_1.Markup.button.callback('❌ Cancelled', `adm_st_CANCELLED_${orderId}`),
        ]);
        buttons.push([telegraf_1.Markup.button.callback('⬅️ Orqaga', 'admin_orders')]);
        return telegraf_1.Markup.inlineKeyboard(buttons);
    }
    static getServiceManagementKeyboard(services) {
        const buttons = services.map((s) => [
            telegraf_1.Markup.button.callback(`${s.isActive ? '🟢' : '🔴'} ${s.nameUz} (${s.price.toLocaleString()} so‘m)`, `adm_srv_detail_${s.id}`),
        ]);
        buttons.push([telegraf_1.Markup.button.callback('➕ Yangi xizmat qo‘shish', 'admin_add_service')]);
        buttons.push([telegraf_1.Markup.button.callback('⬅️ Admin Menu', 'admin_menu')]);
        return telegraf_1.Markup.inlineKeyboard(buttons);
    }
    static getServiceDetailsKeyboard(serviceId, isActive) {
        return telegraf_1.Markup.inlineKeyboard([
            [
                telegraf_1.Markup.button.callback('✏️ Nomi (Edit Name)', `adm_srv_edit_name_${serviceId}`),
                telegraf_1.Markup.button.callback('💰 Narxi (Edit Price)', `adm_srv_edit_price_${serviceId}`),
            ],
            [
                telegraf_1.Markup.button.callback(isActive ? '🔴 Nofaol qilish' : '🟢 Faol qilish', `adm_srv_toggle_${serviceId}`),
            ],
            [telegraf_1.Markup.button.callback('⬅️ Xizmatlar ro‘yxati', 'admin_services')],
        ]);
    }
}
exports.AdminKeyboard = AdminKeyboard;
