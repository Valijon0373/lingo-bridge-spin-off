"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymePaymentProvider = void 0;
const env_config_1 = require("../../config/env.config");
class PaymePaymentProvider {
    name = 'PAYME';
    async createPayment(orderId, orderNumber, amount) {
        const merchantId = env_config_1.env.PAYME_MERCHANT_ID;
        const amountInTiyin = amount * 100;
        // Payme base64 encoded params format: m={merchant_id};ac.order_id={order_id};a={amount_in_tiyin}
        const params = `m=${merchantId};ac.order_id=${orderId};a=${amountInTiyin}`;
        const base64Params = Buffer.from(params).toString('base64');
        const paymentUrl = `https://checkout.paycom.uz/${base64Params}`;
        return {
            success: true,
            paymentUrl,
            paymentId: `PAYME-${orderId}`,
        };
    }
    async verifyPayment(paymentId) {
        return {
            paymentId,
            status: 'PAID',
            rawStatus: 'PAYME_VERIFIED',
        };
    }
}
exports.PaymePaymentProvider = PaymePaymentProvider;
