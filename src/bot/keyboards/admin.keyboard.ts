import { Markup } from 'telegraf';

export class AdminKeyboard {
  public static getAdminDashboardKeyboard() {
    return Markup.inlineKeyboard([
      [
        Markup.button.callback('📊 Statistika olish', 'admin_stats'),
        Markup.button.callback('📢 Broadcast yuborish', 'admin_broadcast'),
      ],
      [
        Markup.button.callback('➕ Yangi xizmat qo‘shish', 'admin_add_service'),
        Markup.button.callback('📄 Xizmatlarni tahrirlash', 'admin_services'),
      ],
      [
        Markup.button.callback('📦 Buyurtmalar', 'admin_orders'),
        Markup.button.callback('📊 Excel yuklash', 'admin_export_excel'),
      ],
      [Markup.button.callback('❌ Yopish', 'admin_close')],
    ]);
  }

  public static getOrderActionKeyboard(orderId: string, status: string) {
    const buttons = [];
    if (status !== 'COMPLETED') {
      buttons.push([Markup.button.callback('📎 Tayyor fayl biriktirish', `adm_attach_${orderId}`)]);
    }
    buttons.push([
      Markup.button.callback('🟢 Paid', `adm_st_PAID_${orderId}`),
      Markup.button.callback('🔵 In Progress', `adm_st_IN_PROGRESS_${orderId}`),
    ]);
    buttons.push([
      Markup.button.callback('✅ Completed', `adm_st_COMPLETED_${orderId}`),
      Markup.button.callback('❌ Cancelled', `adm_st_CANCELLED_${orderId}`),
    ]);
    buttons.push([Markup.button.callback('⬅️ Orqaga', 'admin_orders')]);

    return Markup.inlineKeyboard(buttons);
  }

  public static getServiceManagementKeyboard(services: { id: string; nameUz: string; isActive: boolean; price: number }[]) {
    const buttons = services.map((s) => [
      Markup.button.callback(
        `${s.isActive ? '🟢' : '🔴'} ${s.nameUz} (${s.price.toLocaleString()} so‘m)`,
        `adm_srv_detail_${s.id}`
      ),
    ]);
    buttons.push([Markup.button.callback('➕ Yangi xizmat qo‘shish', 'admin_add_service')]);
    buttons.push([Markup.button.callback('⬅️ Admin Menu', 'admin_menu')]);
    return Markup.inlineKeyboard(buttons);
  }

  public static getServiceDetailsKeyboard(serviceId: string, isActive: boolean) {
    return Markup.inlineKeyboard([
      [
        Markup.button.callback('✏️ Nomi (Edit Name)', `adm_srv_edit_name_${serviceId}`),
        Markup.button.callback('💰 Narxi (Edit Price)', `adm_srv_edit_price_${serviceId}`),
      ],
      [
        Markup.button.callback(
          isActive ? '🔴 Nofaol qilish' : '🟢 Faol qilish',
          `adm_srv_toggle_${serviceId}`
        ),
      ],
      [Markup.button.callback('⬅️ Xizmatlar ro‘yxati', 'admin_services')],
    ]);
  }
}
