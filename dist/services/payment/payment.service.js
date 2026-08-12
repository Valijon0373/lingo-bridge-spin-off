"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentService = exports.PaymentService = void 0;
const mock_provider_1 = require("./mock.provider");
const click_provider_1 = require("./click.provider");
const payme_provider_1 = require("./payme.provider");
const payment_repository_1 = require("../../database/repositories/payment.repository");
const order_repository_1 = require("../../database/repositories/order.repository");
const client_1 = require("@prisma/client");
const env_config_1 = require("../../config/env.config");
const logger_config_1 = require("../../config/logger.config");
class PaymentService {
    provider;
    constructor() {
        this.provider = this.resolveProvider(env_config_1.env.PAYMENT_PROVIDER);
    }
    resolveProvider(providerName) {
        switch (providerName.toUpperCase()) {
            case 'CLICK':
                return new click_provider_1.ClickPaymentProvider();
            case 'PAYME':
                return new payme_provider_1.PaymePaymentProvider();
            case 'MOCK':
            default:
                return new mock_provider_1.MockPaymentProvider();
        }
    }
    setProvider(provider) {
        this.provider = provider;
    }
    async createPayment(orderId) {
        const order = await order_repository_1.orderRepository.findById(orderId);
        if (!order) {
            return { success: false, error: 'Order not found' };
        }
        // SERVER-SIDE CALCULATED TOTAL AMOUNT - NEVER TRUST USER INPUT
        const amount = Number(order.totalPrice);
        const result = await this.provider.createPayment(order.id, order.orderNumber, amount);
        if (result.success) {
            await payment_repository_1.paymentRepository.create({
                orderId: order.id,
                provider: this.provider.name,
                paymentId: result.paymentId,
                amount,
                status: 'PENDING',
            });
        }
        return result;
    }
    async verifyAndConfirmPayment(paymentId, orderId) {
        try {
            const verification = await this.provider.verifyPayment(paymentId);
            if (verification.status === 'PAID') {
                // Update order status in DB
                await order_repository_1.orderRepository.updateStatus(orderId, client_1.OrderStatus.PAID);
                // Also automatically transition to IN_PROGRESS
                await order_repository_1.orderRepository.updateStatus(orderId, client_1.OrderStatus.IN_PROGRESS);
                const payments = await payment_repository_1.paymentRepository.findByOrderId(orderId);
                if (payments.length > 0) {
                    await payment_repository_1.paymentRepository.updateStatus(payments[0].id, 'PAID', new Date());
                }
                return true;
            }
            return false;
        }
        catch (error) {
            logger_config_1.logger.error('Error verifying payment:', error);
            return false;
        }
    }
}
exports.PaymentService = PaymentService;
exports.paymentService = new PaymentService();
