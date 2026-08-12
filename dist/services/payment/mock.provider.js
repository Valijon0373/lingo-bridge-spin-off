"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockPaymentProvider = void 0;
class MockPaymentProvider {
    name = 'MOCK';
    async createPayment(orderId, orderNumber, amount) {
        const mockPaymentId = `MOCK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const mockUrl = `https://example.com/pay?order=${orderNumber}&amount=${amount}&pid=${mockPaymentId}`;
        return {
            success: true,
            paymentUrl: mockUrl,
            paymentId: mockPaymentId,
        };
    }
    async verifyPayment(paymentId) {
        return {
            paymentId,
            status: 'PAID',
            rawStatus: 'SUCCESS_MOCK',
        };
    }
}
exports.MockPaymentProvider = MockPaymentProvider;
