"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentRepository = exports.PaymentRepository = void 0;
const prisma_service_1 = require("../prisma.service");
class PaymentRepository {
    async create(data) {
        return prisma_service_1.prisma.payment.create({
            data: {
                orderId: data.orderId,
                provider: data.provider,
                paymentId: data.paymentId,
                amount: data.amount,
                currency: data.currency || 'UZS',
                status: data.status || 'PENDING',
            },
        });
    }
    async updateStatus(id, status, paidAt) {
        return prisma_service_1.prisma.payment.update({
            where: { id },
            data: {
                status,
                ...(paidAt ? { paidAt } : {}),
            },
        });
    }
    async findByOrderId(orderId) {
        return prisma_service_1.prisma.payment.findMany({
            where: { orderId },
            orderBy: { createdAt: 'desc' },
        });
    }
}
exports.PaymentRepository = PaymentRepository;
exports.paymentRepository = new PaymentRepository();
