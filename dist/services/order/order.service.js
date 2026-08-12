"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderService = exports.OrderService = void 0;
const order_repository_1 = require("../../database/repositories/order.repository");
const service_repository_1 = require("../../database/repositories/service.repository");
const order_number_util_1 = require("../../utils/order-number.util");
const client_1 = require("@prisma/client");
class OrderService {
    async createOrder(params) {
        const service = await service_repository_1.serviceRepository.findById(params.serviceId);
        if (!service) {
            throw new Error('Service not found');
        }
        // SERVER SIDE PRICE COMPUTATION
        const unitPrice = Number(service.price);
        const pages = service.priceType === client_1.PriceType.FIXED ? 1 : Math.max(1, params.pageCount);
        const totalPrice = unitPrice * pages;
        const orderNumber = order_number_util_1.OrderNumberUtil.generateOrderNumber();
        return order_repository_1.orderRepository.create({
            orderNumber,
            userId: params.userId,
            serviceId: params.serviceId,
            sourceLanguage: params.sourceLanguage,
            targetLanguage: params.targetLanguage,
            fileId: params.fileId,
            fileName: params.fileName,
            pageCount: pages,
            unitPrice,
            totalPrice,
        });
    }
    async getUserOrders(userId) {
        return order_repository_1.orderRepository.findByUserId(userId);
    }
    async getOrderDetails(orderId) {
        return order_repository_1.orderRepository.findById(orderId);
    }
    async updateStatus(orderId, status) {
        return order_repository_1.orderRepository.updateStatus(orderId, status);
    }
    async attachResult(orderId, resultFileId) {
        return order_repository_1.orderRepository.attachResultFile(orderId, resultFileId);
    }
}
exports.OrderService = OrderService;
exports.orderService = new OrderService();
