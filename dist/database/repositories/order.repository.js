"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderRepository = exports.OrderRepository = void 0;
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma.service");
class OrderRepository {
    async create(data) {
        return prisma_service_1.prisma.order.create({
            data: {
                orderNumber: data.orderNumber,
                userId: data.userId,
                serviceId: data.serviceId,
                sourceLanguage: data.sourceLanguage,
                targetLanguage: data.targetLanguage,
                fileId: data.fileId,
                fileName: data.fileName,
                pageCount: data.pageCount,
                unitPrice: data.unitPrice,
                totalPrice: data.totalPrice,
                status: client_1.OrderStatus.WAITING_PAYMENT,
            },
            include: {
                service: true,
                user: true,
            },
        });
    }
    async findById(id) {
        return prisma_service_1.prisma.order.findUnique({
            where: { id },
            include: {
                service: true,
                user: true,
            },
        });
    }
    async findByOrderNumber(orderNumber) {
        return prisma_service_1.prisma.order.findUnique({
            where: { orderNumber },
            include: {
                service: true,
                user: true,
            },
        });
    }
    async findByUserId(userId) {
        return prisma_service_1.prisma.order.findMany({
            where: { userId },
            include: {
                service: true,
                user: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async updateStatus(id, status) {
        return prisma_service_1.prisma.order.update({
            where: { id },
            data: { status, updatedAt: new Date() },
            include: {
                service: true,
                user: true,
            },
        });
    }
    async attachResultFile(id, resultFileId) {
        return prisma_service_1.prisma.order.update({
            where: { id },
            data: {
                resultFileId,
                status: client_1.OrderStatus.COMPLETED,
                updatedAt: new Date(),
            },
            include: {
                service: true,
                user: true,
            },
        });
    }
    async countAll() {
        return prisma_service_1.prisma.order.count();
    }
    async countByStatus(status) {
        return prisma_service_1.prisma.order.count({ where: { status } });
    }
    async getTotalRevenue() {
        const aggregate = await prisma_service_1.prisma.order.aggregate({
            where: {
                status: { in: [client_1.OrderStatus.PAID, client_1.OrderStatus.IN_PROGRESS, client_1.OrderStatus.COMPLETED] },
            },
            _sum: {
                totalPrice: true,
            },
        });
        return Number(aggregate._sum.totalPrice || 0);
    }
    async getUserStats(userId) {
        const count = await prisma_service_1.prisma.order.count({ where: { userId } });
        const aggregate = await prisma_service_1.prisma.order.aggregate({
            where: {
                userId,
                status: { in: [client_1.OrderStatus.PAID, client_1.OrderStatus.IN_PROGRESS, client_1.OrderStatus.COMPLETED] },
            },
            _sum: {
                totalPrice: true,
            },
        });
        return {
            orderCount: count,
            totalSpent: Number(aggregate._sum.totalPrice || 0),
        };
    }
    async findAllRecent(limit = 20) {
        return prisma_service_1.prisma.order.findMany({
            take: limit,
            include: {
                service: true,
                user: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findAllForExport() {
        return prisma_service_1.prisma.order.findMany({
            include: {
                service: true,
                user: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
}
exports.OrderRepository = OrderRepository;
exports.orderRepository = new OrderRepository();
