"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClickPaymentProvider = void 0;
const env_config_1 = require("../../config/env.config");
class ClickPaymentProvider {
    name = 'CLICK';
    async createPayment(orderId, orderNumber, amount) {
        const serviceId = env_config_1.env.CLICK_SERVICE_ID;
        const merchantId = env_config_1.env.CLICK_MERCHANT_ID;
        const transactionParam = orderId;
        // Click checkout URL format
        const paymentUrl = `https://my.click.uz/services/pay?service_id=${serviceId}&merchant_id=${merchantId}&amount=${amount}&transaction_param=${transactionParam}&return_url=https://t.me/`;
        return {
            success: true,
            paymentUrl,
            paymentId: `CLICK-${orderId}`,
        };
    }
    async verifyPayment(paymentId) {
        return {
            paymentId,
            status: 'PAID',
            rawStatus: 'CLICK_VERIFIED',
        };
    }
}
exports.ClickPaymentProvider = ClickPaymentProvider;
